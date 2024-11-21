import fs from 'fs';
import path from 'path';

// Loading the required Tree-sitter language modules
import Java from 'tree-sitter-java';
import Python from 'tree-sitter-python';
import Ruby from 'tree-sitter-ruby';
import Go from 'tree-sitter-go';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import Cpp from 'tree-sitter-cpp';
import CSharp from 'tree-sitter-c-sharp';
import C from 'tree-sitter-c';

import { extensionToLanguageMap } from '../models/model.language.map';
import Parser from 'tree-sitter';
import express from 'express';

abstract class ParserUtil {
  abstract getAllFilePaths(directory: string, ignoreList: string[], verbose: boolean): string[];
}

class ParserUtilImpl extends ParserUtil {
  /**
   * Loads a Tree-sitter parser for a given language.
   *
   * @param {string} language - The language to load.
   * @returns {Parser} - The Tree-sitter parser instance for the language.
   */
  loadParserForLanguage(language: string): Parser | null {
    try {
      const parser = new Parser();
      switch (language) {
        case 'cpp':
          parser.setLanguage(Cpp);
          break;
        case 'c++':
          parser.setLanguage(Cpp);
          break;
        case 'c':
          parser.setLanguage(C);
          break;
        case 'java':
          parser.setLanguage(Java);
          break;
        case 'python':
          parser.setLanguage(Python);
          break;
        case 'ruby':
          parser.setLanguage(Ruby);
          break;
        case 'go':
          parser.setLanguage(Go);
          break;
        case 'javascript':
          parser.setLanguage(JavaScript);
          break;
        case 'typescript':
          parser.setLanguage(TypeScript.typescript);
          break;
        case 'csharp':
          parser.setLanguage(CSharp);
          break;
        default:
          console.log('No Tree-sitter parser found for language:', language);
          break;
      }
      return parser;
    } catch (error) {
      console.error(`Error loading Tree-sitter parser for ${language}:`, error);
    }
    return null;
  }

  // Identify programming language based on file extension
  identifyLanguageByExtension(filePath: string): string | undefined {
    const extension = path.extname(filePath);
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

  // EXPERIMENTAL
  /**
   * Shows a 3d-visualization of the dependency graph.
   * Nothing useful - just a cool thing to have.
   */
  async showGraphInSpace(): Promise<void> {
    const open = (await import('open')).default; // Dynamic import for ES module
    const app = express();

    // Path to the assets directory (assuming assets are in the root of the project)
    const assetsPath = path.join(__dirname, '..', 'assets'); // Go up one level from dist to get to src/assets

    // Serve the graph.html from the assets folder
    app.get('/', (req, res) => {
      const graphFilePath = path.join(assetsPath, 'graph.html');
      console.log(graphFilePath);
      res.sendFile(graphFilePath);
    });

    // Serve static files (like JS, CSS) from the assets folder
    app.use(express.static(assetsPath));

    // Serve the oi-dependency.json from the root directory
    app.get('/dependency-graph', (req, res) => {
      const dependencyGraphPath = path.join(__dirname, '..', 'oi-dependency.json');
      fs.readFile(dependencyGraphPath, 'utf-8', (err, data) => {
        if (err) {
          res.status(500).send('Error loading dependency graph');
          return;
        }
        res.json(JSON.parse(data));
      });
    });

    // Start the server
    const port = 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);

      // Automatically open the browser
      open(`http://localhost:${port}`)
        .then(() => console.log('Browser opened automatically.'))
        .catch(err => console.error('Error opening browser:', err));
    });
  }
}

export default new ParserUtilImpl();
