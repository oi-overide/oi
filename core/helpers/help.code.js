/**
 * The `CodeHelper` class handles code block manipulations like extraction, fuzzy matching, and replacement.
 */
class CodeHelper {
    /**
     * Extracts a code block from the content based on a specific format.
     * 
     * @param {string} content - The content to extract the code block from.
     * @param {boolean} verbose - If true, logs the extracted block.
     * @returns {string} - The extracted code block.
     */
    extractCodeBlock(content, verbose = false) {
        const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1]) {
            if (verbose) console.log(`Extracted Code Block: ${codeMatch[1]}`);
            return codeMatch[1];
        } else {
            throw new Error("No code block found in the response");
        }
    }

    /**
     * Finds the index of the old block in the file content using exact matching.
     * 
     * @param {string[]} fileContentLines - The file content split into lines.
     * @param {string[]} oldBlock - The block of old code to find.
     * @returns {number} - The starting index of the old block in the file content or -1 if not found.
     */
    findMatchingIndex(fileContentLines, oldBlock) {
        if (!oldBlock || !Array.isArray(oldBlock) || oldBlock.length === 0) {
            console.log("Invalid oldBlock provided.");
            return -1; // Return -1 if oldBlock is not valid
        }

        const length = fileContentLines.length;

        // Iterate over each line in fileContentLines
        for (let i = 0; i <= length - oldBlock.length; i++) {
            if(fileContentLines[i].trim() === oldBlock[0].trim()) {
                return i;
            }
        }

        return -1; // Return -1 if no match is found
    }

    /**
     * Replaces the old block with the new block in the file content.
     * 
     * @param {string[]} fileContentLines - The content of the file as an array of lines.
     * @param {string[]} oldBlock - The block of old code to replace as an array of lines.
     * @param {string[]} newBlock - The block of new code to insert as an array of lines.
     * @param {number} matchIndex - The index of the old block in the file content.
     * @returns {string[]} - The updated file content as an array of lines.
     */
    replaceOldCodeWithNew(fileContentLines, oldBlock, newBlock, matchIndex) {
        if (matchIndex !== -1) {
            // Remove the old block
            fileContentLines.splice(matchIndex, oldBlock.length);

            // Insert the new block
            fileContentLines.splice(matchIndex, 0, ...newBlock);
            return fileContentLines; // Return updated content
        } else {
            console.log("No significant match found for replacement.");
            return fileContentLines; // No changes made
        }
    }
}

module.exports = new CodeHelper();
