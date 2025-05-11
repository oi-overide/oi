import fs from 'fs';
// import CommandHelper from '../helpers/help.commands';
import LocalCache from './service.cache'; // Only for utility use, no functional dependency.
import { InsertionResponseInfo } from '../models/model.prompts';
import { ReplacementBlock } from '../models/model.response';

abstract class DevService {
  abstract removeAcceptanceMessage(
    filePath: string,
    fileContent: string,
    acceptanceLine: string
  ): void;

  abstract removeCodeBlock(insertionResponse: InsertionResponseInfo): void;
}

class DevServiceImpl extends DevService {
  /**
   * Finds the index of the old block in the file content using a flexible matching approach.
   *
   * @param fileContentLines - The file content split into lines.
   * @param oldBlock - The block of old code to find.
   * @returns The starting index of the old block in the file content or -1 if not found.
   */
  findMatchingIndex(fileContentLines: string[], oldBlock: string[]): number {
    const lineToFind = oldBlock[0] as string;
    for (const line of fileContentLines) {
      if (line.includes(lineToFind)) {
        return fileContentLines.indexOf(line);
      }
    }
    return -1;
  }

  /**
   * Replaces the old block with the new block in the file content.
   *
   * @param fileContentLines - The content of the file as an array of lines.
   * @param oldBlock - The block of old code to replace as an array of lines.
   * @param newBlock - The block of new code to insert as an array of lines.
   * @param matchIndex - The index of the old block in the file content.
   * @returns The updated file content as an array of lines.
   */
  replaceOldCodeWithNew(
    fileContentLines: string[],
    oldBlock: string[],
    newBlock: string[],
    matchIndex: number
  ): string[] {
    if (matchIndex !== -1) {
      // Remove the old block
      fileContentLines.splice(matchIndex, oldBlock.length);

      // Insert the new block
      fileContentLines.splice(matchIndex, 0, ...newBlock);
      return fileContentLines; // Return updated content
    } else {
      console.log('No significant match found for replacement.');
      return fileContentLines; // No changes made
    }
  }

  /**
   * Removes an acceptance message from the file content if it exists.
   *
   * @param {string} filePath - The path to the file.
   * @param {string} fileContent - The content of the file.
   * @param {string} acceptanceLine - The acceptance line to be removed.
   */
  removeAcceptanceMessage(filePath: string, fileContent: string, acceptanceLine: string): void {
    try {
      // Check if the acceptance message is in the file
      const acceptanceIndex = fileContent.indexOf(acceptanceLine);
      if (acceptanceIndex !== -1) {
        // Find the position of the last occurrence of "//-" before the acceptance message
        const contentBeforeAcceptance = fileContent.slice(0, acceptanceIndex);
        const lastDashIndex = contentBeforeAcceptance.lastIndexOf('//-');

        if (lastDashIndex !== -1) {
          // Create a new string with the first "//-" removed
          const updatedContent =
            fileContent.slice(0, lastDashIndex) + fileContent.slice(lastDashIndex + 3); // Skip the "//-"

          // Remove the acceptance message
          const finalContent = updatedContent.replace(acceptanceLine, '');

          // Write the updated content back to the file
          fs.writeFileSync(filePath, finalContent, 'utf-8');
          console.log('Acceptance message and preceding //- removed successfully');
        } else {
          console.log('No preceding //- found to remove');
        }
      } else {
        console.log('Acceptance message not found');
      }
    } catch (error) {
      console.log('Error removing acceptance message:', error);
    }
  }

  /**
   * Removes a specific code block from the file content, either replacing it with cached code or removing it entirely.
   *
   * @param {string} filePath - The path to the file to be modified.
   * @param {string} fileContent - The content of the file.
   * @param {string} replacedCode - The code block to be removed.
   */
  removeCodeBlock(insertionResponse: InsertionResponseInfo): void {
    try {
      let updatedContent = insertionResponse.fileContent;

      // Remove the acceptance line
      updatedContent.replace(insertionResponse.acceptanceLine, '');
      if (insertionResponse.oldCode) {
        updatedContent = insertionResponse.fileContent.replace(
          insertionResponse.newCode,
          insertionResponse.oldCode
        );

        console.log('Code block processed successfully');
      } else {
        updatedContent = insertionResponse.fileContent.replace(insertionResponse.newCode, '');
        console.log('Code block not found');
      }

      fs.writeFileSync(insertionResponse.filePath, updatedContent, 'utf-8'); // Write updated content
    } catch (error) {
      console.log('Error removing code block:', error);
    }
  }

  /**
   * Applies code replacements to the specified file using the `CodeHelper` utility for fuzzy matching.
   *
   * @param {string} filePath - The path to the file.
   * @param {Array} parsedBlocks - The blocks containing find and replace info.
   */
  async applyCodeReplacement(filePath: string, parsedBlocks: ReplacementBlock[]): Promise<void> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8'); // Read current file content
      let fileContentLines = fileContent.split('\n'); // Split content into lines

      for (const block of parsedBlocks) {
        const oldBlock = block.find; // Access the find property
        const newBlock = ['//-', ...block.replace, '//> Accept the changes (y/n): -//']; // Access the replace property
        LocalCache.addOldCode(block); // Add old block to cache

        // Find the index of the matching old block using CodeHelper
        const matchIndex = this.findMatchingIndex(fileContentLines, oldBlock);
        if (matchIndex !== -1) {
          // Replace the old block with the new block
          fileContentLines = this.replaceOldCodeWithNew(
            fileContentLines,
            oldBlock,
            newBlock,
            matchIndex
          );
        } else {
          console.warn(`No match found for block: ${oldBlock}`);
        }
      }

      // Remove all lines with prompt markers after processing the entire thing.
      fileContentLines = fileContentLines.filter(
        line => !line.includes('//>') || !line.includes('<//')
      );

      // Write updated content back to the file
      const updatedContent = fileContentLines.join('\n');
      await fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content
    } catch (error) {
      console.error('Error applying code replacement:', error);
    }
  }
}

export default new DevServiceImpl();
