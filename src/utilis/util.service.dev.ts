// import { CompletionType } from '../../types/type.promptInfo';

/**
 * The `CodeHelper` class handles code block manipulations like extraction, fuzzy matching, and replacement.
 */
class DevServiceUtil {
  /**
   * Extracts a code block from the content based on a specific format.
   *
   * @param content - The content to extract the code block from.
   * @param verbose - If true, logs the extracted block.
   * @returns The extracted code block.
   * @throws Error if no code block is found.
   */
  extractCodeBlock(content: string, verbose: boolean = false): string {
    const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
    if (codeMatch && codeMatch[1]) {
      if (verbose) console.log(`Extracted Code Block: ${codeMatch[1]}`);
      return codeMatch[1];
    } else {
      throw new Error('No code block found in the response');
    }
  }

  /**
   * Finds the index of the old block in the file content using a flexible matching approach.
   *
   * @param fileContentLines - The file content split into lines.
   * @param oldBlock - The block of old code to find.
   * @returns The starting index of the old block in the file content or -1 if not found.
   */
  findMatchingIndex(fileContentLines: string[], oldBlock: string[]): number {
    const lineToFind = oldBlock[0];
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
}

export default new DevServiceUtil();
