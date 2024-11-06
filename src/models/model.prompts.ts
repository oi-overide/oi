export type InsertionResponse = 'accepted' | 'rejected';

export interface InsertionRequestInfo {
  prompt: string;
  filePath: string;
  fileContent: string;
}

export interface InsertionResponseInfo {
  newCode: string;
  oldCode: string;
  filePath: string;
  fileContent: string;
  insertionResponse: InsertionResponse;
  acceptanceLine: string;
}

export interface SystemPromptInfo {
  [platform: string]: SystemPromptPlatformInfo;
}

export interface SystemPromptPlatformInfo {
  systemMessage: string;
  context: string;
  format: string;
  instructions: string[];
}
