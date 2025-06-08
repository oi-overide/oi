import fs from 'fs';
import path from 'path';

abstract class ParserUtil {
  abstract getAllFilePaths(directory: string, ignoreList: string[], verbose: boolean): string[];
}

class ParserUtilImpl extends ParserUtil {
  /**
   * Recursively gathers all file paths in a directory, respecting ignore patterns.
   *
   * @param {string} directory - The path of the directory to scan.
   * @param {string[]} ignoreList - List of patterns for files to ignore.
   * @param {boolean} verbose - Flag to enable verbose logging.
   * @returns {string[]} - An array of file paths.
   */
  getAllFilePaths(
    directory: string,
    ignoreList: string[] = [],
    verbose: boolean = false
  ): string[] {
    let filePaths: string[] = [];

    const files = fs.readdirSync(directory); // Read the contents of the directory

    for (const file of files) {
      const filePath = path.join(directory, file); // Get the full path of the file
      const stat = fs.statSync(filePath); // Get file statistics

      // Check if the file or directory matches any ignore pattern
      const shouldIgnore = ignoreList.some(ignorePattern => filePath.includes(ignorePattern));

      if (shouldIgnore) {
        if (verbose) {
          console.log(`Skipping ignored path: ${filePath}`); // Log ignored paths if verbose
        }
        continue; // Skip this file/directory
      }

      if (stat.isDirectory()) {
        // Recur for subdirectories
        if (verbose) {
          console.log(`Entering directory: ${filePath}`);
        }
        filePaths = filePaths.concat(this.getAllFilePaths(filePath, ignoreList, verbose)); // Recursive call
      } else {
        // Add file path to the list
        filePaths.push(filePath);

        if (verbose) {
          console.log(`Found file: ${filePath}`); // Log found file if verbose
        }
      }
    }

    return filePaths;
  }
}

export default new ParserUtilImpl();
