export type FileContents = {
  [filePath: string]: string;
};

// Define types for capturing class structure
export interface FunctionData {
  code: string;
  embeddings?: number[]; // The embedding can be optional.
}

export interface ClassData {
  className: string;
  functions: FunctionData[];
  embeddings?: number[]; // The embedding can be optional.
}

export interface DependencyGraph {
  fileName: string;
  path: string;
  imports: string[];
  classes: ClassData[];
  topLevelFunctions: FunctionData[]; // Adding a separate array for top-level functions
}

export interface LanguagePatterns {
  language: string;
  functionRegex: RegExp;
  classRegex: RegExp;
  importRegex?: RegExp;
}

export interface FileDependency {
  fileName: string;
  path: string;
  imports: string[];
  classes: ClassData[];
  topLevelFunctions: FunctionData[];
}
