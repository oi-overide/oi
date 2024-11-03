import fs from 'fs'; // Import the file system module
import path from 'path';
import {
  ClassData,
  DependencyGraph,
  FileContents,
  FileDependency,
  FunctionData,
  LanguagePatterns
} from '../models/model.depgraph';

// Define file paths and types
const DEPENDENCY_FILE_PATH = path.join(process.cwd(), 'oi-dependency.json');

abstract class ParserService {
  abstract parseFile(filepath: string, fileContent: string): DependencyGraph;
  abstract identifyLanguage(fileContent: string): string | undefined;
  abstract updateDependencyFile(filepath: string): Promise<void>;
  abstract createDependencyGraph(dirPath: string, ignoreList: string[], verbose: boolean): void;
}

// Implementation for ParserService
class ParserServiceImpl extends ParserService {
  // Stores the contents of all files in the project
  private fileContents: FileContents = {};

  // Define regex patterns for different languages
  private languagePatterns: LanguagePatterns[] = [
    {
      language: 'python',
      functionRegex: /\bdef\s+([a-zA-Z_]\w*)\s*\((.*?)\)\s*:/g,
      classRegex: /\b(class)\s+([a-zA-Z_]\w*)\s*(\((.*?)\))?:/g,
      importRegex: /^\s*(import|from)\s+[a-zA-Z_][\w.]*\s*/gm
    },
    {
      language: 'javascript',
      functionRegex:
        /\bfunction\s+([a-zA-Z_$][\w$]*)\s*\((.*?)\)\s*\{|([a-zA-Z_$][\w$]*)\s*=\s*\((.*?)\)\s*=>\s*\{/g,
      classRegex: /\b(class)\s+([a-zA-Z_]\w*)\s*(extends\s+[a-zA-Z_]\w*)?\s*\{/g,
      importRegex: /^\s*import\s+.*\s+from\s+['"][^'"]+['"]/gm
    },
    {
      language: 'java',
      functionRegex:
        /\b(public|protected|private)?\s*(static\s+)?(final\s+)?\w+\s+([a-zA-Z_]\w*)\s*\((.*?)\)\s*\{/g,
      classRegex:
        /\b(public|protected|private)?\s*(abstract\s+)?(class|interface)\s+([a-zA-Z_]\w*)\s*(extends\s+[a-zA-Z_]\w*)?\s*(implements\s+[a-zA-Z_][\w\s,]*)?\s*\{/g,
      importRegex: /^\s*import\s+[a-zA-Z_][\w.]*\s*;/gm
    },
    {
      language: 'c_cpp',
      functionRegex: /(?:[a-zA-Z_]\w*\s+)+([a-zA-Z_]\w*)\s*\((.*?)\)\s*\{/g,
      classRegex: /\b(class|struct)\s+([a-zA-Z_]\w*)\s*\{/g
    }
    // Add similar patterns for other languages as needed...
  ];

  // Identify programming language based on content
  identifyLanguage(fileContent: string): string | undefined {
    for (const pattern of this.languagePatterns) {
      if (pattern.classRegex.test(fileContent) || pattern.functionRegex.test(fileContent)) {
        return pattern.language;
      }
    }
    return undefined; // Unknown language
  }

  /**
   * Recursively gathers files in a directory, reading their contents and
   * storing them in the provided object, while respecting ignore patterns.
   *
   * @param {string} dirPath - The path of the directory to scan.
   * @param {FileContents} fileContents - An object to store file paths and their contents.
   * @param {string[]} ignoreList - List of patterns for files to ignore.
   * @param {boolean} verbose - Flag to enable verbose logging.
   */
  createDependencyGraph(
    dirPath: string,
    ignoreList: string[] = [],
    verbose: boolean = false
  ): void {
    const files = fs.readdirSync(dirPath); // Read the contents of the directory

    for (const file of files) {
      const filePath: string = path.join(dirPath, file); // Get the full path of the file
      const stat = fs.statSync(filePath); // Get file statistics

      // Check if the file or directory (or its parent) is in the ignore list
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
        this.createDependencyGraph(filePath, ignoreList, verbose); // Recursive call
      } else {
        // Read and store file content
        const content = fs.readFileSync(filePath, 'utf-8');
        this.fileContents[filePath] = content; // Store content in the provided object

        if (verbose) {
          console.log(`Read file: ${filePath}`); // Log file read if verbose
        }
      }
    }
  }

  // New method to update oi-dependency.json with the latest graph of a changed file
  async updateDependencyFile(filepath: string): Promise<void> {
    try {
      // Read the modified file content
      const fileContent = fs.readFileSync(filepath, 'utf-8');

      // Parse the file to get the dependency graph
      const newGraph = this.parseFile(filepath, fileContent);

      // Load the existing dependency JSON or create a new array if it doesn’t exist
      let dependencyData: FileDependency[] = [];
      if (fs.existsSync(DEPENDENCY_FILE_PATH)) {
        const fileContent = fs.readFileSync(DEPENDENCY_FILE_PATH, 'utf-8');
        dependencyData = JSON.parse(fileContent);
      }

      // Check if the file already exists in the dependency data
      const existingIndex = dependencyData.findIndex(dep => dep.path === filepath);
      if (existingIndex !== -1) {
        // Update the existing entry
        dependencyData[existingIndex] = newGraph;
      } else {
        // Add a new entry
        dependencyData.push(newGraph);
      }

      // Save the updated dependency data back to oi-dependency.json
      fs.writeFileSync(DEPENDENCY_FILE_PATH, JSON.stringify(dependencyData, null, 2));
      console.log(`Updated dependency graph for ${filepath} in oi-dependency.json`);
    } catch (error) {
      console.error(`Error updating dependency graph for ${filepath}:`, error);
    }
  }

  // Modified function for parsing
  parseFile(filepath: string, fileContent: string): DependencyGraph {
    const language = this.identifyLanguage(fileContent);
    if (!language) {
      throw new Error(`Unsupported or unidentified language for file: ${filepath}`);
    }

    const patterns = this.languagePatterns.find(p => p.language === language);
    if (!patterns) {
      throw new Error(`Patterns not found for language: ${language}`);
    }

    const classMatches = [...fileContent.matchAll(patterns.classRegex)];
    const functionMatches = [...fileContent.matchAll(patterns.functionRegex)];
    const imports = patterns.importRegex
      ? [...fileContent.matchAll(patterns.importRegex)].map(match => match[0].trim())
      : [];

    const classes: ClassData[] = [];
    const topLevelFunctions: FunctionData[] = [];
    let currentClass: ClassData | null = null;

    // Process each class match to build initial class structures
    for (const classMatch of classMatches) {
      const className = classMatch[2];
      const newClass: ClassData = { className, functions: [] };
      classes.push(newClass);
    }

    // Track the current class while iterating through function matches
    for (const functionMatch of functionMatches) {
      const functionCode = functionMatch[0].trim();

      // Determine if the function belongs to the current class
      if (currentClass) {
        currentClass.functions.push({ code: functionCode });
      } else {
        // If there's no current class, add to top-level functions
        topLevelFunctions.push({ code: functionCode });
      }

      // Check if a new class is encountered (and update `currentClass`)
      const nextClassMatch = classMatches.find(match => match.index! > functionMatch.index!);
      if (nextClassMatch) {
        const className = nextClassMatch[2];
        currentClass = classes.find(cls => cls.className === className) || null;
      } else {
        currentClass = null; // Reset if no more classes are found
      }
    }

    // Construct the dependency graph
    const graph: DependencyGraph = {
      fileName: path.basename(filepath),
      path: filepath,
      imports: imports,
      classes: classes,
      topLevelFunctions: topLevelFunctions
    };

    return graph;
  }
}

export default new ParserServiceImpl();
