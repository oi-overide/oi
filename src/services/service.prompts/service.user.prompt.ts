import cacheService from '../../services/service.cache';
import { InsertionRequestInfo, InsertionResponseInfo } from '../../models/model.prompts';
import serviceParser from '../service.parser';

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

  abstract findInsertionRequests(
    filePath: string, // filePath: string,
    fileContent: string,
    verbose: boolean,
    isEmbedding: boolean
  ): Promise<InsertionRequestInfo[] | undefined>;

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
      const insertionMatches = this.matchRegex(UserPromptService.regGenerated, fileContent);

      // Loop through each match and process it
      for (const match of insertionMatches) {
        const acceptanceMatches = this.matchRegex(UserPromptService.regAcceptance, match[0]);
        for (const acceptanceMatch of acceptanceMatches) {
          if (acceptanceMatch[1] === 'y' || acceptanceMatch[1] === 'n') {
            // Pre-process the current code to match the saved content
            const currentCode = (match[0] as string)
              .split('\n')
              .filter(line => !line.includes('//-') || !line.includes('-//'))
              .join('\n');

            // Get the old and new code from cache.
            const oldCode = cacheService.findOldCode(currentCode);

            // Add the insertion request to the list
            insertionResponses.push({
              filePath: filePath,
              fileContent: fileContent,
              newCode: currentCode,
              oldCode: oldCode ? oldCode : '',
              insertionResponse: acceptanceMatch[1] === 'y' ? 'accepted' : 'rejected',
              acceptanceLine: acceptanceMatch[0]
            });
          }
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
    verbose: boolean = false,
    isEmbedding: boolean = false
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
          const prompt = match[1].trim();
          let promptEmbedding: number[] = [];

          if (isEmbedding) {
            // Get embedding for current prompt.
            promptEmbedding = await serviceParser.getEmbeddingForPrompt(prompt, fileContent);
          }

          // Add the insertion request to the list
          insertionRequests.push({
            prompt: prompt,
            filePath: filePath,
            fileContent: fileContent,
            promptEmbedding: promptEmbedding
          });

          console.log(`INSERTION REQUEST ${insertionRequests}`);
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
