const fuzzy = require('fuzzy');
const LocalCache = require('../cache/cache.oldcode');

/**
 * The `CodeHelper` class handles code block manipulations like extraction and fuzzy replacement.
 */
class CodeHelper {
    /**
     * Extracts the code block from the specified content.
     * 
     * @param {string} content - The content to extract the code block from.
     * @param {boolean} verbose - If true, logs the extracted block.
     * @returns {string} The extracted code block.
     */
    extractCodeBlock(content, verbose = false) {
        const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1]) {
            if (verbose) console.log(`Code Block: ${codeMatch[1]}`);
            return JSON.parse(codeMatch[1]);  // Return the extracted code
        } else {
            throw new Error("No code block found in the response");
        }
    }

    /**
     * Applies multiple find-and-replace blocks to the specified file.
     * 
     * @param {string} fileContent - The content of the file.
     * @param {Array} codeBlocks - The array of find-and-replace blocks in the format [{ find: "entire old block", replace: "entire new block" }].
     * @returns {string} - The updated file content.
     */
    applyMultipleCodeDiffs(fileContent, codeBlocks) {
        for (let { find: oldBlock, replace: newBlock } of codeBlocks) {
            // Step 1: FuzzyFind the entire oldBlock.
            const oldBlockIndex = this.findFuzzyMatchIndex(fileContent, oldBlock);
            console.log("OldBlock", oldBlock);

            if (oldBlockIndex !== -1) {
                // Add the old block to the local cache
                LocalCache.addOldCode(oldBlock); // Add old code to cache

                // Step 2: Prepare the new content with messages
                const newContentWithMessages = `//-\n${newBlock}\n//> Accept the changes (y/n): -//`;

                // Step 3: Remove the old block and insert the new content with messages.
                fileContent = this.replaceBlock(fileContent, oldBlock, newContentWithMessages);
            }
        }

        // Before returning, remove the prompt from the file content
        const promptIndex = fileContent.indexOf('//>');
        const endIndex = fileContent.indexOf('<//', promptIndex); // Find the corresponding <// after //>
        if (promptIndex !== -1 && endIndex !== -1) {
            // Remove the prompt section
            fileContent = fileContent.substring(0, promptIndex) + fileContent.substring(endIndex + '<//'.length);
        }

        // Return the updated file content as a string.
        return fileContent;
    }

    /**
     * Finds the fuzzy match index of the given old block in the file content.
     * 
     * @param {string} fileContent - The content of the file as a single string.
     * @param {string} oldBlock - The block of old code as a string.
     * @returns {number} - The index of the matched block, or -1 if no match is found.
     */
    findFuzzyMatchIndex(fileContent, oldBlock) {
        const matches = fuzzy.filter(oldBlock, [fileContent], { pre: '<', post: '>' });

        if (matches.length > 0) {
            // Return the index of the best match
            return matches[0].score > 0.5 ? matches[0].index : -1; // Only match if the score is significant
        }

        return -1; // No match found
    }

    /**
     * Replaces the old block with the new block in the file content.
     * 
     * @param {string} fileContent - The content of the file as a single string.
     * @param {string} oldBlock - The block of old code to replace.
     * @param {string} newBlock - The block of new code to insert.
     * @returns {string} - The updated file content.
     */
    replaceBlock(fileContent, oldBlock, newBlock) {
        // Use regular string replacement to swap out the old block with the new block.
        return fileContent.replace(oldBlock, newBlock);
    }
}

module.exports = new CodeHelper();
