import fs from 'fs';
import CommandHelper from '../helpers/help.commands';
import LocalCache from '../cache/cache.oldcode'; // Only for utility use, no functional dependency.
import CodeHelper from '../helpers/help.code'; // Only for utility use, no functional dependency.
import { ReplacementBlock } from '../../interfaces/interfaces';


/**
 * The `CodeInterface` class provides methods for manipulating code blocks and 
 * managing code changes within specified files.
 */
class CodeInterface {
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
                    const updatedContent = fileContent.slice(0, lastDashIndex) + 
                                           fileContent.slice(lastDashIndex + 3); // Skip the "//-"
    
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
    removeCodeBlock(filePath: string, fileContent: string, replacedCode: string): void {
        try {
            const oldCode = LocalCache.findOldCode(replacedCode);
            let updatedContent = fileContent;

            if (oldCode) {
                updatedContent = fileContent.replace(replacedCode, oldCode);
                console.log('Code block processed successfully');
            } else {
                updatedContent = fileContent.replace(replacedCode, '');
                console.log('Code block not found');
            }

            fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content
        } catch (error) {
            console.log('Error removing code block:', error);
        }
    }

    /**
     * Inserts a new code block into the file at the position of the specified prompt.
     * 
     * @param {string} filePath - The path to the file to be modified.
     * @param {string} prompt - The prompt that identifies where to insert the new code.
     * @param {string} newCode - The new code to be inserted.
     */
    insertCodeBlock(filePath: string, prompt: string, newCode: string): void {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8'); // Read current file content
            // Just remove the prompt line.
            const nopromptContent = fileContent.replace('//>', '').replace('<//', '').trim();
            if (fileContent.includes(prompt)) {            
                const codeBlock = `
                    //-
                    ${newCode}
                    //> Accept the changes (y/n): -//
                `;
                const updatedContent = nopromptContent.replace(prompt, codeBlock); // Replace prompt with new code block
                fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content
                console.log('Code block inserted successfully');
            } else {
                console.log('Prompt not found');
            }
        } catch (error) {
            console.log('Error inserting code block:', error);
        }
    }

    /**
     * Applies code replacements to the specified file using the `CodeHelper` utility for fuzzy matching.
     * 
     * @param {string} filePath - The path to the file.
     * @param {Array} replacementBlocks - The blocks containing find and replace info.
     */
    async applyCodeReplacement(filePath: string, replacementBlocks: string): Promise<void> {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8'); // Read current file content
            let fileContentLines = fileContent.split('\n'); // Split content into lines

            const parsedBlocks: ReplacementBlock[] = JSON.parse(replacementBlocks);

            // Remove all lines with //> prompt markers
            fileContentLines = fileContentLines.filter(line => !line.includes('//>') || !line.includes('<//'));

            for (const block of parsedBlocks) {
                const oldBlock = block.find; // Access the find property
                const newBlock = ["//-", ...block.replace, "//> Accept the changes (y/n): -//"]; // Access the replace property

                LocalCache.addOldCode(block); // Add old block to cache

                // Find the index of the matching old block using CodeHelper
                const matchIndex = CodeHelper.findMatchingIndex(fileContentLines, oldBlock);

                if (matchIndex !== -1) {
                    // Replace the old block with the new block
                    fileContentLines = CodeHelper.replaceOldCodeWithNew(fileContentLines, oldBlock, newBlock, matchIndex);
                } else {
                    console.warn(`No match found for block: ${oldBlock}`);
                }
            }

            // Write updated content back to the file
            const updatedContent = fileContentLines.join('\n');
            await fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content
        } catch (error) {
            console.error('Error applying code replacement:', error);
        }
    }
}

export default new CodeInterface();
