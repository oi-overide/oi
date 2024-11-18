import fs from 'fs';
import path from 'path';

import Parser, { SyntaxNode } from 'tree-sitter'; // Import the Tree-sitter parser
import { ClassData, DependencyGraph, FunctionData, GlobalData } from '../models/model.depgraph';
import utilParser from '../utilis/util.parser';
import serviceEmbedding from './service.embedding';
import utilCommandConfig from '../utilis/util.command.config';

abstract class ParserService {}

// Implementation for ParserService
class ParserServiceImpl extends ParserService {
  /**
   * Generates a dependency graph for a single file.
   *
   * @param {string} filePath - The path to the file.
   * @param {boolean} verbose - Enable verbose logging.
   * @returns {DependencyGraph | null} - The dependency graph for the file or null if processing fails.
   */
  async makeFileDepGraph(
    filePath: string,
    verbose: boolean = false
  ): Promise<DependencyGraph | null> {
    const language = utilParser.identifyLanguageByExtension(filePath);

    if (!language) {
      if (verbose) console.log(`Language not identified for file: ${filePath}`);
      throw new Error('UNSUP_LANG');
    }

    // Load the corresponding Tree-sitter parser for the identified language
    let parser: Parser | null = null;
    try {
      parser = utilParser.loadParserForLanguage(language);
    } catch (error) {
      if (verbose) {
        console.log(`Tree-sitter parser not found or failed to load for ${language}: ${error}`);
      }
      return null;
    }

    if (parser) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const tree = parser.parse(fileContent);
      let depGraph: DependencyGraph = this.extractDepGraphNodeData(filePath, tree);
      depGraph = await serviceEmbedding.getEmbeddingsForDepGraph(depGraph);
      return depGraph;
    }

    return null;
  }

  /**
   * Generates a dependency graph for all files in a given directory.
   *
   * @param {string} directory - The root directory for generating dependency graphs.
   * @param {string[]} ignoreList - List of file patterns to ignore.
   * @param {boolean} verbose - Enable verbose logging.
   * @returns {DependencyGraph[]} - Array of dependency graphs for each file.
   */
  async makeProjectDepGraph(
    directory: string,
    ignoreList: string[] = [],
    verbose: boolean = false
  ): Promise<DependencyGraph[]> {
    const filePaths = utilParser.getAllFilePaths(directory, ignoreList, verbose);
    const dependencyGraphs: DependencyGraph[] = [];

    for (const filePath of filePaths) {
      const language = utilParser.identifyLanguageByExtension(filePath);

      if (!language) {
        if (verbose) console.log(`Language not identified for file: ${filePath}`);
        continue;
      }

      // Load the corresponding Tree-sitter parser for the identified language
      let parser: Parser | null = null;
      try {
        parser = utilParser.loadParserForLanguage(language);

        if (parser) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const tree = parser.parse(fileContent);
          let dependencyGraph = this.extractDepGraphNodeData(filePath, tree);
          dependencyGraph = await serviceEmbedding.getEmbeddingsForDepGraph(dependencyGraph);
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
   * Incrementally updates the `oi-dependency.json` with the dependency graph of a single file.
   *
   * @param {string} filePath - The path to the file to be incrementally updated.
   * @param {boolean} verbose - Enable verbose logging.
   */
  async makeProjectDepGraphInc(
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
      let newDependencyGraph = await this.makeFileDepGraph(filePath, verbose);

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

        // Write updated dependencies back to files
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
   * Finds the nearest relative node to the given one.
   *
   * @param filePath The center node for which to find dependency.
   * @returns returns the list of nodes (DependencyGraph[]) which are nearest relative.
   */
  makeContextFromDepGraph(filePath: string): DependencyGraph[] {
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
   * Extracts dependency information from parsed Tree-sitter tree.
   *
   * @param {string} filePath - The file path.
   * @param {string} fileContent - The file content.
   * @param {Parser.Tree} tree - The parsed syntax tree.
   * @param {string} language - The language of the file.
   * @returns {DependencyGraph} - The dependency graph for the file.
   */
  private extractDepGraphNodeData(filePath: string, tree: Parser.Tree): DependencyGraph {
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
}

export default new ParserServiceImpl();
