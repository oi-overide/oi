import cacheService from '../../services/service.cache';
import {
  CompletionType,
  InsertionRequestInfo,
  InsertionResponseInfo
} from '../../models/model.prompts';

abstract class UserPromptService {
  // Regular expressions to match specific prompt types
  static regPrompt: RegExp = /\/\/>\s*((?:(?!-\/\/)[\s\S])*?)\s*<\/\//g; // Matches user prompts
  static regGenerated: RegExp = /\/\/-\s*([\s\S]*?)\s*-\/\//g; // Matches generated code blocks
  static regAcceptance: RegExp = /\/\/>\s*Accept the changes \(y\/n\):\s*([ynYN])\s*-\/\//g; // Matches acceptance prompts

  // Regular expressions for specific annotations
  static regComment: RegExp = /\/\/@\s*comment\s*$/g; // Matches //@comment with no extra text after it
  static regContext: RegExp = /\/\/@\s*context\s*$/g; // Matches //@context with no extra text after it
  static regComplete: RegExp = /\/\/@\s*complete\s*$/g; // Matches //@complete with no extra text after it

  // abstract identifyPromptCase(text: string): UserPromptInfo[];

  abstract matchRegex(regex: RegExp, text: string): IterableIterator<RegExpMatchArray>;

  abstract findCompletionType(fileContent: string, prompt: string): CompletionType;

  abstract findInsertionResponses(
    filePath: string,
    fileContent: string,
    verbose: boolean
  ): Promise<InsertionResponseInfo[] | undefined>;

  abstract findInsertionResponses(
    filePath: string,
    fileContent: string,
    verbose: boolean
  ): Promise<InsertionResponseInfo[] | undefined>;
}

class UserPromptServiceImpl extends UserPromptService {
  /**
   * Matches the provided text against a specified regular expression.
   *
   * @param regex - The regular expression to use for matching.
   * @param text - The text to match against.
   * @returns The result of the match, or null if no match was found.
   */
  matchRegex(regex: RegExp, text: string): IterableIterator<RegExpMatchArray> {
    return text.matchAll(regex);
  }

  /**
   * Determines the completion type for the found prompt.
   * If no code exists in the file and only a prompt is found, it returns 'complete'.
   * If code exists and the user wants to update it, it returns 'update'.
   *
   * @param {string} fileContent - The content of the file being processed.
   * @param {string} prompt - The prompt text found in the file.
   * @returns {string} The completion type: 'complete' or 'update'.
   */
  findCompletionType(fileContent: string, prompt: string): CompletionType {
    let hasCode: boolean = false;

    // Basic logic to check if the file contains code besides the prompt
    const fileLines = fileContent.trim().split('\n');

    fileLines.forEach(line => {
      if (!line.trim().includes(prompt)) {
        console.log(line);
        hasCode = true;
      }
    });

    // Return 'complete' if no code exists, else 'update'
    return hasCode ? 'update' : 'complete';
  }

  /**
   * Finds the context surrounding a prompt in the file content.
   *
   * @param {string} fileContent - The entire content of the file as a string.
   * @param {string} prompt - The specific prompt text to find in the file.
   * @param {boolean} verbose - A flag indicating whether to log detailed messages.
   * @returns {Promise<[string, string]>} - A promise that resolves to an array containing the file content and trimmed prompt.
   */
  async findPromptContext(
    fileContent: string,
    prompt: string,
    verbose: boolean
  ): Promise<[string, string]> {
    try {
      if (verbose) {
        console.log('Creating Prompt Context');
      }

      // Clean and trim the prompt text by removing delimiters and excess whitespace
      const trimmedPrompt = prompt
        .replace('//>', '')
        .replace('<//', '')
        .replace('\n', '')
        .replace('//', '')
        .trim();

      // Return the extracted context: file content and trimmed prompt
      return [fileContent, trimmedPrompt];
    } catch (e) {
      // Log and throw any errors encountered during context extraction
      console.error('Error creating prompt context:', e);
      throw e;
    }
  }

  async findInsertionResponses(
    filePath: string,
    fileContent: string,
    verbose: boolean = false
  ): Promise<InsertionResponseInfo[] | undefined> {
    try {
      const insertionResponses: InsertionResponseInfo[] = [];

      if (verbose) {
        console.log(`Searching for prompts in ${filePath}`);
      }

      // Get all prompt matches using matchRegex
      const insertionMatches = this.matchRegex(UserPromptService.regAcceptance, fileContent);

      // Loop through each match and process it
      for (const match of insertionMatches) {
        if (match[1]) {
          // Get the old and new code from cache.
          const oldCode = cacheService.findOldCode(match[1]);

          // Add the insertion request to the list
          insertionResponses.push({
            filePath: filePath,
            fileContent: fileContent,
            newCode: match[1],
            oldCode: oldCode ? oldCode : '',
            insertionResponse: match[0] === 'y' ? 'accepted' : 'rejected',
            acceptanceLine: match[0]
          });
        }
      }

      return Promise.resolve(insertionResponses);
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Error processing file ${filePath}:`, err.message);
        throw err;
      }
    }
  }

  async findInsertionRequests(
    filePath: string, // filePath: string,
    fileContent: string,
    verbose: boolean = false
  ): Promise<InsertionRequestInfo[] | undefined> {
    try {
      const insertionRequests: InsertionRequestInfo[] = [];

      if (verbose) {
        console.log(`Searching for prompts in ${filePath}`);
      }

      // Get all prompt matches using matchRegex
      const promptMatches = this.matchRegex(UserPromptService.regPrompt, fileContent);

      // Loop through each match and process it
      for (const match of promptMatches) {
        if (match[1]) {
          // Get the completion type.
          const completionType = this.findCompletionType(fileContent, match[1]);

          // Add the insertion request to the list
          insertionRequests.push({
            prompt: match[1].trim(),
            filePath: filePath,
            fileContent: fileContent,
            completionType: completionType
          });
        }
      }

      return Promise.resolve(insertionRequests);
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Error processing file ${filePath}:`, err.message);
        throw err;
      }
    }
  }
}

export default new UserPromptServiceImpl();
