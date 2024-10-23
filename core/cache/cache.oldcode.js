const fuzz = require('fuzzball');

/**
 * LocalCache is a singleton class that stores old code blocks 
 * for later retrieval and uses fuzzy matching to find matches 
 * within those stored blocks.
 */
class LocalCache {
    constructor() {
        // Ensure that only one instance of LocalCache is created.
        if (!LocalCache.instance) {
            this.oldCodeArray = []; // Initialize the array to store old code blocks.
            LocalCache.instance = this; // Store the instance for singleton behavior.
        }
        return LocalCache.instance; // Return the single instance.
    }

    /**
     * Adds a new old code block to the cache.
     * 
     * @param {string} code - The old code block to be added.
     */
    addOldCode(code) {
        this.oldCodeArray.push(code); // Add the old code block to the array.
    }

    /**
     * Finds an old code block using fuzzy matching.
     * 
     * @param {string} fuzzyMatchString - The string to match against the old code blocks.
     * @returns {string|null} - Returns the best match if found; otherwise, returns null.
     */
    findOldCode(fuzzyMatchString) {
        let bestMatch = null;
        let highestScore = 0;

        // Iterate over each old code block in the array
        for (let oldCode of this.oldCodeArray) {
            console.log("CACHE CODE: ", oldCode);

            const cleanMatchString = fuzzyMatchString.split('\n').filter(line => !line.includes('//-') && !line.includes('//>')).join(' ');

            console.log("MATCH CODE: ", fuzzyMatchString);

            // Perform fuzzy matching using fuzzball with a similarity score
            const score = fuzz.ratio(cleanMatchString, oldCode);
            console.log("Fuzzball score:", score);

            if (score > highestScore) {
                highestScore = score;
                bestMatch = oldCode;
            }
        }

        console.log("Best match found with score:", highestScore);

        return bestMatch;
    }
}

// Ensure singleton behavior
const instance = new LocalCache();
Object.freeze(instance); // Freeze the instance to prevent modification.

module.exports = instance; // Export the singleton instance.
