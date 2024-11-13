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
import { ClassData, DependencyGraph, FunctionData, GlobalData } from '../models/model.depgraph';
import utilCommandConfig from '../utilis/util.command.config';
import serviceNetwork from './service.network';
import CommandHelper from '../utilis/util.command.config';
import { ActivePlatformDetails } from '../models/model.config';
import serviceDev from './service.dev';

abstract class ParserService {
  abstract generateIncrementalDepForFile(
    filePath: string,
    ignoreList: string[],
    verbose: boolean
  ): Promise<boolean>;
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
      throw new Error('UNSUP_LANG');
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
      return this.extractDependencyData(filePath, tree);
    }

    return null;
  }

  /**
   * Incrementally updates the `oi-dependency.json` with the dependency graph of a single file.
   *
   * @param {string} filePath - The path to the file to be incrementally updated.
   * @param {boolean} verbose - Enable verbose logging.
   */
  async generateIncrementalDepForFile(
    filePath: string,
    ignoreList: string[],
    verbose: boolean = false
  ): Promise<boolean> {
    const dependencyFile = 'oi-dependency.json';
    let existingDependencies: DependencyGraph[] = [];

    // Load existing dependency data if the file exists
    if (fs.existsSync(dependencyFile)) {
      const rawData = fs.readFileSync(dependencyFile, 'utf8');
      existingDependencies = JSON.parse(rawData);
    }

    // Check if the file or directory matches any ignore pattern
    const shouldIgnore = ignoreList.some(ignorePattern => filePath.includes(ignorePattern));

    if (shouldIgnore) {
      if (verbose) {
        console.log(`Skipping ignored path: ${filePath}`); // Log ignored paths if verbose
      }
      return true;
    }

    try {
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
        return false;
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'UNSUP_LANG') {
        console.error('Overide does not support dependency graph in this language');
        return false;
      }
    }

    return true;
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
    let embeddingServiceDetails: ActivePlatformDetails = CommandHelper.getActiveServiceDetails(
      true
    ) as ActivePlatformDetails;

    if (!embeddingServiceDetails) {
      console.log("Please enable embeddings by running 'overide config --embedding'");
      return [];
    }

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

        if (parser) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const tree = parser.parse(fileContent);
          let dependencyGraph = this.extractDependencyData(filePath, tree);
          dependencyGraph = await this.getCodeEmbeddings(dependencyGraph, embeddingServiceDetails);
          dependencyGraphs.push(dependencyGraph);
        }
      } catch (error) {
        if (verbose) {
          console.log(`Tree-sitter parser not found or failed to load for ${language} ${error}`);
        }
        continue;
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
  private extractDependencyData(filePath: string, tree: Parser.Tree): DependencyGraph {
    const fileName = path.basename(filePath);
    const imports: string[] = [];
    const classes: ClassData[] = [];
    const globals: GlobalData[] = [];
    const functions: FunctionData[] = [];

    const traverseNode = (node: SyntaxNode, currentClass: string | null = null): void => {
      // Direct checks for import, class, and function nodes
      if (node.isNamed) {
        switch (node.type) {
          // Combine import statements for different languages
          case 'import_statement':
          case 'preproc_include': // C/C++ #include
          case 'import_from_statement': // Python's `from ... import ...`
          case 'require_statement': // Ruby `require ...`
          case 'using_directive': // C# `using ...`
            imports.push(node.text);
            break;

          // Combine class declarations for different languages
          case 'class_definition': // Python
          case 'class_declaration': // Java, JavaScript, TypeScript, C#
          case 'class': // Ruby `class ... end`
          case 'struct_declaration': // Go's struct as class
            const classData = this.extractClassData(node);
            currentClass = classData.className;
            classes.push(classData);
            break;

          // Combine function declarations for different languages
          case 'function_declaration': // JavaScript, TypeScript, Go
          case 'method_declaration': // Java, C#, C++ (methods)
          case 'function_definition': // C, C++, Go, Python
          case 'method_definition': // Ruby methods `def ... end`
            functions.push(this.extractFunctionData(node, currentClass));
            break;

          // Global Code (any code outside of classes/functions)
          default:
            // If node is not part of class or function, it's global code
            if (
              node.type === 'expression_statement' &&
              node.parent &&
              (node.parent.type === 'program' || node.parent.type === 'module')
            ) {
              globals.push({ code: node.text });
            }
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
      globals,
      classes,
      functions
    };
  }

  /**
   * Generates Embeddings for the give dependency graph.
   *
   * @param graph - The dependency graph node.
   * @param embeddingServiceDetails - Platform details for OpenAI.
   * @returns - Updated dependency graph node with embeddings.
   */
  async getCodeEmbeddings(
    graph: DependencyGraph,
    embeddingServiceDetails: ActivePlatformDetails
  ): Promise<DependencyGraph> {
    try {
      // Get the dependency graph.
      for (const functions of graph.functions) {
        functions.embeddings = await serviceNetwork.getCodeEmbedding(
          functions.code,
          embeddingServiceDetails
        );
      }
      return graph;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      }
      throw e;
    }
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
    className: string | null
  ): FunctionData {
    const code = functionNode.text;
    return { class: className || '', code, embeddings: [] };
  }

  /**
   * Finds the nearest relative node to the given one.
   *
   * @param filePath The center node for which to find dependency.
   * @returns returns the list of nodes (DependencyGraph[]) which are nearest relative.
   */
  buildContextGraph(filePath: string): DependencyGraph[] {
    // Load the dependency graph
    const depgraph: DependencyGraph[] | null = utilCommandConfig.loadDependencyGraph();

    if (!depgraph) {
      return [];
    }

    const adjNodes: DependencyGraph[] = [];

    // Find the current file in dep graph.
    let currentNode: DependencyGraph | undefined = depgraph.filter(
      node => node.path === filePath
    )[0];

    if (!currentNode) {
      return [];
    }

    // Get all edges.
    for (const importstm of currentNode.imports) {
      // Get the fileName from the import.
      const importParts = importstm.split('/');
      if (importParts.length === 1) {
        continue;
      }
      const fileName = (importParts[importParts.length - 1] as string)
        .replace("'", '')
        .replace(';', '');

      const graphOfImport: DependencyGraph[] | undefined = depgraph.filter(node =>
        node.path.includes(fileName)
      );

      if (!graphOfImport) {
        continue;
      } else {
        adjNodes.push(...graphOfImport);
      }
    }

    return adjNodes;
  }

  /**
   * Generates a contextual prompt and gets embeddings for that.
   *
   * @param {string} prompt - Prompt entered by the user
   * @param fileContent  - File contents with the prompt.
   * @returns {number[]} - Embeddings for the prompt
   */
  async getEmbeddingForPrompt(prompt: string, fileContent: string): Promise<number[]> {
    const platformDetails = CommandHelper.getActiveServiceDetails(true);

    if (!platformDetails) {
      return [];
    }

    const fileLines = fileContent.split('\n');
    const promptIndex = serviceDev.findMatchingIndex(fileLines, prompt.split('\n'));
    const remainingLines = fileLines.length - promptIndex - 1;
    let lastIndex = fileLines.length - 1;

    if (remainingLines > 5) {
      lastIndex = promptIndex + 5;
    }

    const finalPromtArry = [];

    for (let i = promptIndex - 5; i < lastIndex; i++) {
      finalPromtArry.push(fileLines[i]);
    }

    const promptString = finalPromtArry.join('\n');

    console.log(promptString);

    return await serviceNetwork.getCodeEmbedding(promptString, platformDetails);
  }

  /**
   * Checks the similarity of two vector embeddings.
   * @param vec1 - Embedding prompt
   * @param vec2 - Embedding for the functions.
   * @returns {number} - Similarity factor.
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must be of the same length');
    }

    // Calculate the dot product safely
    const dotProduct = vec1.reduce((sum, value, index) => sum + value * vec2[index]!, 0);

    const normVec1 = Math.sqrt(vec1.reduce((sum, value) => sum + value * value, 0));
    const normVec2 = Math.sqrt(vec2.reduce((sum, value) => sum + value * value, 0));

    if (normVec1 === 0 || normVec2 === 0) {
      throw new Error('Vectors must not be zero-vectors');
    }

    return dotProduct / (normVec1 * normVec2);
  }
}

export default new ParserServiceImpl();
