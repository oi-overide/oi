import { ratio } from 'fuzzball';
import { ReplacementBlock } from '../models/model.response';

/**
 * LocalCache is a singleton class that stores old code blocks
 * for later retrieval and uses fuzzy matching to find matches
 * within those stored blocks.
 */
class LocalCache {
  private static instance: LocalCache; // Singleton instance
  private cache: ReplacementBlock[]; // Array to store old code blocks

  private constructor() {
    this.cache = []; // Initialize the array to store old code blocks
  }

  /**
   * Returns the singleton instance of LocalCache.
   */
  public static getInstance(): LocalCache {
    if (!LocalCache.instance) {
      LocalCache.instance = new LocalCache();
    }
    return LocalCache.instance;
  }

  /**
   * Adds a new old code block to the cache.
   *
   * @param {CodeBlock} replacement - The old code block to be added.
   */
  public addOldCode(replacement: ReplacementBlock): void {
    this.cache.push(replacement); // Add the old code block to the array
  }

  /**
   * Finds the old code based on the new code provided.
   *
   * @param {string} replacedCode - The new code lines that were inserted.
   * @returns {string[]|null} - Returns the corresponding find array or null if not found.
   */
  findOldCode(replacedCode: string): string | null {
    for (const entry of this.cache) {
      const replaceString = entry.replace.join('\n');

      // Check for similarity using Fuzzball's fuzzyScore
      const score = ratio(replacedCode, replaceString);

      // Threshold for similarity
      const threshold = 75;

      if (score >= threshold) {
        // if the prompt was the only find and replace line then we can return the empty string.
        return entry.find
          .filter(line => !line.includes('//>') || !line.includes('<//'))
          .join('\n')
          .trim(); // Return the corresponding code.
      }
    }
    return null; // Return null if no match found
  }
}

// Ensure singleton behavior
const instance = LocalCache.getInstance();
Object.freeze(instance); // Freeze the instance to prevent modification

export default instance; // Export the singleton instance
