const fs = require('fs');
const DirectoryHelper = require('../helpers/help.directory');
const LocalCache = require('../cache/cache.oldcode');
const CodeHelper = require('../helpers/help.code'); // Only for utility use, no functional dependency.

/**
 * The `CodeInterface` class provides methods for manipulating code blocks and 
 * managing code changes within specified files.
 */
class CodeInterface {
    /**
     * Removes an acceptance message from the file content if it exists.
     * 
     * @param {string} fileContent - The content of the file.
     * @param {string} acceptanceLine - The acceptance line to be removed.
     */
    removeAcceptanceMessage(filePath, fileContent, acceptanceLine) {
        try {
            if (fileContent.includes(acceptanceLine)) {
                let updatedContent = fileContent.replace(acceptanceLine, '');
                updatedContent = updatedContent.split('\n').filter(line => !line.includes('//-')).join('\n'); 
                fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content
                console.log('Acceptance message removed successfully');
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
     * @param {string} replacedCode - The code block to be removed.
     */
    removeCodeBlock(filePath, fileContent, replacedCode) {
        try {
            const oldcode = LocalCache.findOldCode(replacedCode);
            let updatedContent = fileContent;
            if (oldcode) {
                updatedContent = fileContent.replace(replacedCode, oldcode);
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
    insertCodeBlock(filePath, prompt, newCode) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8'); // Read current file content
            if (fileContent.includes(prompt)) {
                const codeBlock = `
                    //-${prompt.trim()}
                    ${newCode}
                    //> Accept the changes (y/n): -//
                `;
                const updatedContent = fileContent.replace(prompt, codeBlock); // Replace prompt with new code block
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
    async applyCodeReplacement(filePath, replacementBlocks) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8'); // Read current file content
            let fileContentLines = fileContent.split('\n'); // Split content into lines

            const prasedBlocks = JSON.parse(replacementBlocks);

            // Remove all lines with //> prompt markers
            fileContentLines = fileContentLines.filter(line => !line.includes('//>') || !line.includes('<//'));

            for (let block of prasedBlocks) {
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
            await DirectoryHelper.writeFileContent(filePath, updatedContent);
        } catch (error) {
            console.error('Error applying code replacement:', error);
        }
    }
}

module.exports = new CodeInterface();
