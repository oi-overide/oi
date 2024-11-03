export type CompletionType = 'complete' | 'update';
export type InsertionResponse = 'accepted' | 'rejected';

/**
 * Type representing the information of a prompt.
 */
// export type UserPromptInfo = {
//   type: 'prompt' | 'acceptance'; // The type of prompt
//   content: string; // The content of the prompt
//   lineIndex: number; // The line index where the prompt was found
//   codeBlock: string; // Optional code block for acceptance prompts
//   acceptanceLine?: string; // Optional acceptance line for acceptance prompts
// };

export interface InsertionRequestInfo {
  prompt: string;
  filePath: string;
  fileContent: string;
  completionType: CompletionType;
}

export interface InsertionResponseInfo {
  newCode: string;
  oldCode: string;
  filePath: string;
  fileContent: string;
  insertionResponse: InsertionResponse;
  acceptanceLine?: string;
}

export interface SystemPromptInfo {
  [platform: string]: SystemPromptPlatformInfo;
}

export interface SystemPromptPlatformInfo {
  systemMessage: string;
  complete: {
    format: string;
    instructions: string[];
  };
  update: {
    context: string;
    format: string;
    instructions: string[];
  };
}
