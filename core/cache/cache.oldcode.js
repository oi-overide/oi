const fuzzball = require('fuzzball');

/**
 * LocalCache is a singleton class that stores old code blocks 
 * for later retrieval and uses fuzzy matching to find matches 
 * within those stored blocks.
 */
class LocalCache {
    constructor() {
        // Ensure that only one instance of LocalCache is created.
        if (!LocalCache.instance) {
            this.cache = []; // Initialize the array to store old code blocks.
            LocalCache.instance = this; // Store the instance for singleton behavior.
        }
        return LocalCache.instance; // Return the single instance.
    }

    /**
     * Adds a new old code block to the cache.
     * 
     * @param {string} code - The old code block to be added.
     */
    addOldCode(replacement) {
        this.cache.push(replacement); // Add the old code block to the array.
    }

    /**
     * Finds the old code based on the new code provided.
     * 
     * @param {string[]} replacedCode - The new code lines that were inserted.
     * @returns {string[]|null} - Returns the corresponding find array or null if not found.
     */
    findOldCode(replacedCode) {
        const newCodeString = replacedCode;

        for (const entry of this.cache) {
            const replaceString = entry.replace.join('\n');

            // Check for similarity using Fuzzball's fuzzyScore
            const score = fuzzball.ratio(newCodeString, replaceString);

            // Threshold for similarity
            const threshold = 75; // Example threshold

            if (score >= threshold) {
                return entry.find.join('\n'); // Return the corresponding find array
            }
        }
        return null; // Return null if no match found
    }
}

// Ensure singleton behavior
const instance = new LocalCache();
Object.freeze(instance); // Freeze the instance to prevent modification.

module.exports = instance; // Export the singleton instance.
