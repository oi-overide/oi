import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { extensionToLanguageMap } from '../models/model.language.map';

// Define file paths and types
// const DEPENDENCY_FILE_PATH = path.join(process.cwd(), 'oi-dependency.json');

abstract class ParserService {
  abstract installTreeSitter(language: string): Promise<void>;
  abstract identifyLanguageByExtension(filePath: string): string | undefined;
  abstract getAllFilePaths(directory: string, ignoreList: string[], verbose: boolean): string[];
}

// Implementation for ParserService
class ParserServiceImpl extends ParserService {
  // Install tree-sitter parsers
  async installTreeSitter(language: string): Promise<void> {
    try {
      // Check if Tree-sitter is installed, if not, install it
      console.log('Setting up Tree-sitter parsers...');
      execSync('npm install -g tree-sitter', { stdio: 'inherit' });

      switch (language) {
        case 'cpp':
          execSync('npm install -g tree-sitter-cpp', { stdio: 'inherit' });
          break;
        case 'c++':
          execSync('npm install -g tree-sitter-cpp', { stdio: 'inherit' });
          break;
        case 'c':
          execSync('npm install -g tree-sitter-c', { stdio: 'inherit' });
          break;
        case 'java':
          execSync('npm install -g tree-sitter-java', { stdio: 'inherit' });
          break;
        case 'python':
          execSync('npm install -g tree-sitter-python', { stdio: 'inherit' });
          break;
        case 'ruby':
          execSync('npm install -g tree-sitter-ruby', { stdio: 'inherit' });
          break;
        case 'go':
          execSync('npm install -g tree-sitter-go', { stdio: 'inherit' });
          break;
        case 'javascript':
          execSync('npm install -g tree-sitter-javascript', { stdio: 'inherit' });
          break;
        case 'typescript':
          execSync('npm install -g tree-sitter-typescript', { stdio: 'inherit' });
          break;
        case 'csharp':
          execSync('npm install -g tree-sitter-c-sharp', { stdio: 'inherit' });
          break;
        default:
          console.log('No Tree-sitter parser found for language:', language);
          break;
      }

      console.log('Tree-sitter setup complete.');
    } catch (error) {
      console.error('Failed to set up Tree-sitter:', error);
    }
  }

  // Identify programming language based on file extension
  identifyLanguageByExtension(filePath: string): string | undefined {
    const extension = path.extname(filePath);
    console.log('EXTENTION ', extension);
    return extensionToLanguageMap[extension] || undefined;
  }

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

export default new ParserServiceImpl();
