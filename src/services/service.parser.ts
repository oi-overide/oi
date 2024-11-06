import fs from 'fs';
import path from 'path';
import Parser, { SyntaxNode } from 'tree-sitter'; // Import the Tree-sitter parser

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
import { ClassData, DependencyGraph, FunctionData } from '../models/model.depgraph';

// Define file paths and types
// const DEPENDENCY_FILE_PATH = path.join(process.cwd(), 'oi-dependency.json');

abstract class ParserService {
  abstract identifyLanguageByExtension(filePath: string): string | undefined;
  abstract getAllFilePaths(directory: string, ignoreList: string[], verbose: boolean): string[];
  abstract generateDependencyGraph(
    directory: string,
    ignoreList: string[],
    verbose: boolean
  ): Promise<DependencyGraph[]>;
}

// Implementation for ParserService
class ParserServiceImpl extends ParserService {
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

  /**
   * Generates a dependency graph for a single file.
   *
   * @param {string} filePath - The path to the file.
   * @param {boolean} verbose - Enable verbose logging.
   * @returns {DependencyGraph | null} - The dependency graph for the file or null if processing fails.
   */
  async getFileDependencyGraph(
    filePath: string,
    verbose: boolean = false
  ): Promise<DependencyGraph | null> {
    const language = this.identifyLanguageByExtension(filePath);

    if (!language) {
      if (verbose) console.log(`Language not identified for file: ${filePath}`);
      return null;
    }

    // Load the corresponding Tree-sitter parser for the identified language
    let parser: Parser | null = null;
    try {
      parser = this.loadParserForLanguage(language);
    } catch (error) {
      if (verbose) {
        console.log(`Tree-sitter parser not found or failed to load for ${language}: ${error}`);
      }
      return null;
    }

    if (parser) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const tree = parser.parse(fileContent);
      return this.extractDependencyData(filePath, fileContent, tree);
    }

    return null;
  }

  /**
   * Incrementally updates the `oi-dependency.json` with the dependency graph of a single file.
   *
   * @param {string} filePath - The path to the file to be incrementally updated.
   * @param {boolean} verbose - Enable verbose logging.
   */
  async generateIncrementalDepForFile(filePath: string, verbose: boolean = false): Promise<void> {
    const dependencyFile = 'oi-dependency.json';
    let existingDependencies: DependencyGraph[] = [];

    // Load existing dependency data if the file exists
    if (fs.existsSync(dependencyFile)) {
      const rawData = fs.readFileSync(dependencyFile, 'utf8');
      existingDependencies = JSON.parse(rawData);
    }

    const newDependencyGraph = await this.getFileDependencyGraph(filePath, verbose);

    if (newDependencyGraph) {
      const index = existingDependencies.findIndex(dep => dep.path === filePath);

      if (index !== -1) {
        // Update existing entry
        existingDependencies[index] = newDependencyGraph;
        if (verbose) console.log(`Updated dependency graph for file: ${filePath}`);
      } else {
        // Add new entry
        existingDependencies.push(newDependencyGraph);
        if (verbose) console.log(`Added new dependency graph for file: ${filePath}`);
      }

      // Write updated dependencies back to file
      fs.writeFileSync(dependencyFile, JSON.stringify(existingDependencies, null, 2));
      if (verbose) console.log(`Dependency file updated at ${dependencyFile}`);
    } else {
      if (verbose) console.log(`Failed to generate dependency graph for file: ${filePath}`);
    }
  }

  /**
   * Generates a dependency graph for all files in a given directory.
   *
   * @param {string} directory - The root directory for generating dependency graphs.
   * @param {string[]} ignoreList - List of file patterns to ignore.
   * @param {boolean} verbose - Enable verbose logging.
   * @returns {DependencyGraph[]} - Array of dependency graphs for each file.
   */
  async generateDependencyGraph(
    directory: string,
    ignoreList: string[] = [],
    verbose: boolean = false
  ): Promise<DependencyGraph[]> {
    const filePaths = this.getAllFilePaths(directory, ignoreList, verbose);
    const dependencyGraphs: DependencyGraph[] = [];

    for (const filePath of filePaths) {
      const language = this.identifyLanguageByExtension(filePath);

      if (!language) {
        if (verbose) console.log(`Language not identified for file: ${filePath}`);
        continue;
      }

      // Load the corresponding Tree-sitter parser for the identified language
      let parser: Parser | null = null;
      try {
        parser = this.loadParserForLanguage(language);
      } catch (error) {
        if (verbose) {
          console.log(`Tree-sitter parser not found or failed to load for ${language} ${error}`);
        }
        continue;
      }

      console.log('PARSER ', parser);

      if (parser) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const tree = parser.parse(fileContent);
        const dependencyGraph = this.extractDependencyData(filePath, fileContent, tree);
        dependencyGraphs.push(dependencyGraph);
      }
    }

    return dependencyGraphs;
  }

  /**
   * Loads a Tree-sitter parser for a given language.
   *
   * @param {string} language - The language to load.
   * @returns {Parser} - The Tree-sitter parser instance for the language.
   */
  private loadParserForLanguage(language: string): Parser | null {
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

  /**
   * Extracts dependency information from parsed Tree-sitter tree.
   *
   * @param {string} filePath - The file path.
   * @param {string} fileContent - The file content.
   * @param {Parser.Tree} tree - The parsed syntax tree.
   * @param {string} language - The language of the file.
   * @returns {DependencyGraph} - The dependency graph for the file.
   */
  private extractDependencyData(
    filePath: string,
    fileContent: string,
    tree: Parser.Tree
  ): DependencyGraph {
    const fileName = path.basename(filePath);
    const imports: string[] = [];
    const classes: ClassData[] = [];
    const functions: FunctionData[] = [];

    const traverseNode = (node: SyntaxNode, currentClass: string | null = null): void => {
      console.log(
        `Node type: ${node.type}, Named: ${node.isNamed}, Grammar Type: ${node.grammarType}`
      );

      // Direct checks for import, class, and function nodes
      if (node.isNamed) {
        switch (node.type) {
          case 'import_statement':
            imports.push(node.text);
            break;
          case 'class_declaration':
            const classData = this.extractClassData(node);

            // Assigning the class name to the current class
            currentClass = classData.className;
            // Add the class to the list.

            classes.push(classData);
            break;
          case 'method_definition':
          case 'function_declaration':
          case 'function_definition':
            functions.push(this.extractFunctionData(node, fileContent, currentClass));
            break;
        }
      }

      // Recursively process named children
      node.namedChildren.forEach(child => traverseNode(child, currentClass));
    };

    // Begin traversal from the root node
    traverseNode(tree.rootNode);

    return {
      fileName,
      path: filePath,
      imports,
      classes,
      functions
    };
  }

  /**
   * Extracts data for a class.
   *
   * @param {Parser.SyntaxNode} classNode - The class node from Tree-sitter.
   * @returns {ClassData} - The extracted class data.
   */
  private extractClassData(classNode: Parser.SyntaxNode): ClassData {
    const className = classNode.childForFieldName('name')?.text || 'UnnamedClass';
    return {
      className,
      embeddings: []
    };
  }

  /**
   * Extracts data for a function, associating it with its class if provided.
   *
   * @param {Parser.SyntaxNode} functionNode - The function node.
   * @param {string} fileContent - The content of the file.
   * @param {string | null} className - The name of the class the function belongs to.
   * @returns {FunctionData} - The extracted function data.
   */
  private extractFunctionData(
    functionNode: Parser.SyntaxNode,
    fileContent: string,
    className: string | null
  ): FunctionData {
    const code = fileContent.slice(functionNode.startIndex, functionNode.endIndex);
    return { class: className || 'Global', code, embeddings: [] };
  }
}

export default new ParserServiceImpl();
