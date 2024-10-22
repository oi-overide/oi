const fs = require('fs');
const CodeHelper = require('../helpers/help.code');
const DirectoryHelper = require('../helpers/help.directory');
const LocalCache = require('../cache/cache.oldcode');

/**
 * The `CodeInterface` class provides methods for manipulating code blocks and 
 * acceptance messages within specified files.
 */
class CodeInterface {
    /**
     * Removes an acceptance message from the file content if it exists.
     * 
     * @param {string} fileContent - The current content of the file.
     * @param {string} filePath - The path to the file to be modified.
     * @param {string} acceptanceLine - The acceptance line to be removed.
     */
    removeAcceptanceMessage = (fileContent, filePath, acceptanceLine) => {
        try {
            // Check if the acceptance line exists in the file content
            if (fileContent.includes(acceptanceLine)) {
                const updatedContent = fileContent.replace(`${acceptanceLine}`, '');
                fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content back to the file
                console.log('Acceptance message removed successfully');
            } else {
                console.log('Acceptance message not found in file path');
            }
        } catch (e) {
            console.log('Error removing acceptance message from file path:', e);
        }
    }

    /**
     * Removes a specific code block from the file content if it exists.
     * 
     * @param {string} fileContent - The current content of the file.
     * @param {string} filePath - The path to the file to be modified.
     * @param {string} codeBlock - The code block to be removed.
     */
    removeCodeBlock = (fileContent, filePath, codeBlock) => {
        try {
            const oldCodeBlock = LocalCache.findOldCode(codeBlock); // Find the corresponding old code block in the cache
            if (fileContent.includes(codeBlock)) {
                if (oldCodeBlock) {
                    const updatedContent = fileContent.replace(`${codeBlock}`, oldCodeBlock); // Replace old code with the cached code
                    fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content back to the file
                    console.log('Code block replaced with cached old code successfully');
                } else {
                    // Check if the code block exists in the file content
                    const updatedContent = fileContent.replace(`${codeBlock}`, '');
                    fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content back to the file
                    console.log('Code block removed successfully');
                }
            }
        } catch (e) {
            console.log('Error removing code block from file path:', e);
        }
    }

    /**
     * Inserts a new code block into the file at the position of the specified prompt.
     * 
     * @param {string} filePath - The path to the file to be modified.
     * @param {string} prompt - The prompt that identifies where to insert the new code.
     * @param {string} newCode - The new code to be inserted.
     */
    insertCodeBlock = (filePath, prompt, newCode) => {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8'); // Read current file content
            // Check if the prompt exists in the file content
            if (fileContent.includes(prompt)) {
                // Prepare the new code block format
                const promptContent = prompt.replace('//>', '').replace('<//', '').trim();
                const codeBlock = `
                    //-${promptContent}
                    ${newCode}
                    //> Accept the changes (y/n): -//
                `;
                const updatedContent = fileContent.replace(prompt, codeBlock); // Replace prompt with the new code block
                fs.writeFileSync(filePath, updatedContent, 'utf-8'); // Write updated content back to the file
                console.log('Code block inserted successfully');
            } else {
                console.log('Prompt not found in file path');
            }
        } catch (e) {
            console.log('Error inserting code block in file path:', e);
        }
    }

    /**
     * Applies fuzzy code replacement to the specified file.
     * 
     * @param {string} filePath - The path to the file.
     * @param {Array} replacementBlocks - The blocks containing find and replace info.
     */
    async applyFuzzyReplacement(filePath, replacementBlocks) {
        try {
            const fileContent = await DirectoryHelper.readFileContent(filePath);
            const updatedContent = CodeHelper.applyMultipleCodeDiffs(fileContent, replacementBlocks);
            await DirectoryHelper.writeFileContent(filePath, updatedContent);
        } catch (error) {
            console.error('Error applying fuzzy replacement:', error);
        }
    }
}

module.exports = new CodeInterface();
