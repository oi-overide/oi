export type FileContents = {
  [filePath: string]: string;
};

// Define types for capturing class structure
export interface FunctionData {
  class: string;
  code: string;
  embeddings?: number[]; // The embedding can be optional.
}

export interface ClassData {
  className: string;
  embeddings?: number[]; // The embedding can be optional.
}

export interface GlobalData {
  code: string;
  embeddings?: number[];
}

export interface DependencyGraph {
  fileName: string;
  path: string;
  imports: string[];
  globals: GlobalData[];
  classes: ClassData[];
  functions: FunctionData[]; // Adding a separate array for top-level functions
}

export interface LanguagePatterns {
  language: string;
  functionRegex: RegExp;
  classRegex: RegExp;
  importRegex?: RegExp;
}
