const fuzzball = require('fuzzball');
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
    extractCodeBlock(content, completionType, verbose = false) {
        const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1]) {
            if (verbose) console.log(`Code Block: ${codeMatch[1]}`);
            if (completionType === "update") {
                return JSON.parse(codeMatch[1]);  // Return the extracted code
            }
            return codeMatch[1];
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

            if (oldBlockIndex !== -1) {
                // Add the old block to the local cache
                LocalCache.addOldCode(oldBlock); // Add old code to cache

                // Step 2: Prepare the new content with messages
                const newContentWithMessages = `//-\n${newBlock}\n//> Accept the changes (y/n): -//`;

                // Step 3: Remove the old block and insert the new content with messages.
                fileContent = this.replaceOldCodeWithNew(fileContent, oldBlock, newContentWithMessages, oldBlockIndex);
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
        // Clean the old code block by removing extra whitespace, line breaks, etc.
        const cleanedOldBlock = oldBlock.replace(/\s+/g, ' ').trim();

        // Split the file content into smaller chunks (e.g., lines or paragraphs)
        const fileContentLines = fileContent.split('\n\n'); // Splitting into paragraphs

        // Iterate over the file content chunks and perform fuzzy matching on each
        let bestMatch = -1;
        let bestScore = 0;

        fileContentLines.forEach((chunk, index) => {
            const cleanedChunk = chunk.replace(/\s+/g, ' ').trim();

            // Perform fuzzy matching for the old code against this chunk
            const score = fuzzball.ratio(cleanedOldBlock, cleanedChunk);

            // If we get a higher score, update the best match and store the index
            if (score > bestScore) {
                bestScore = score;
                bestMatch = index;
            }
        });

        // Return the index of the match or -1 if no significant match is found
        return bestScore > 50 ? bestMatch : -1; // Adjust the score threshold here
    }


    /**
     * Replaces the old block with the new block in the file content.
     * 
     * @param {string} fileContent - The content of the file as a single string.
     * @param {string} oldBlock - The block of old code to replace.
     * @param {string} newBlock - The block of new code to insert.
     * @param {number} matchIndex - The index of the old block in the file content.
     * @returns {string} - The updated file content.
     */
    replaceOldCodeWithNew(fileContent, oldBlock, newBlock, matchIndex) {
        if (matchIndex !== -1) {
            const updatedContent = fileContent.split('\n\n').map((chunk, index) => {
                return index === matchIndex ? newBlock : chunk;
            }).join('\n\n');
            return updatedContent; // Return the updated file content
        } else {
            console.log("No significant match found for replacement.");
            return fileContent; // No changes made
        }
    }
}

module.exports = new CodeHelper();
