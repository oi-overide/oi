import fs from 'fs';
import PromptHelper from '../helpers/help.prompt';
import CodeInterface from '../middleware/mid.code';
import FindContext from './find.context';
import FormatRequest from '../formatter/format.request';
import FormatResponse from '../formatter/format.response';
import Network from '../network/network';

import { CompletionType, UserPromptInfo } from '../../types/type.promptInfo';

/**
 * The `FindPrompt` class is responsible for identifying prompts or acceptance cases
 * in a file, generating the necessary code or performing the required actions based
 * on the identified prompt, and managing the code insertion or rejection process.
 *
 * Responsibilities:
 * - Search for prompt cases or acceptance responses in file content.
 * - Generate and format code based on identified prompts.
 * - Insert generated code into the appropriate location within the file.
 * - Handle user acceptance or rejection of code suggestions.
 */
class FindPrompt {
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

        fileLines.forEach((line) => {
            if (!line.trim().includes(prompt)) {
                console.log(line);
                hasCode = true;
            }
        })

    // Return 'complete' if no code exists, else 'update'
    return hasCode ? 'update' : 'complete';
  }

  /**
   * Handles the acceptance case found in a file.
   * Removes either the entire code block if rejected, or the acceptance message if accepted.
   *
   * @param {string} acceptanceLine - The line containing the acceptance response.
   * @param {string} codeBlock - The block of code associated with the acceptance.
   * @param {string} response - The user's response, either 'y' (accept) or 'n' (reject).
   * @param {string} fileContent - The content of the file.
   * @param {string} filePath - The path to the file being processed.
   */
  async handleFoundAcceptance(
    acceptanceLine: string,
    codeBlock: string,
    response: string,
    fileContent: string,
    filePath: string
  ): Promise<void> {
    // Remove the code block if the user rejects it
    if (response === 'n') {
      await CodeInterface.removeCodeBlock(filePath, fileContent, codeBlock);
      return;
    }

    // Remove the acceptance message if the user accepts the suggestion
    if (response === 'y') {
      await CodeInterface.removeAcceptanceMessage(filePath, fileContent, acceptanceLine);
      return;
    }
  }

  /**
   * Handles the prompt found in a file.
   * Gathers context, formats a request, makes a network request, and inserts the generated code.
   *
   * @param {number} index - The index (line number) of the prompt within the file.
   * @param {string} fileContent - The content of the file being processed.
   * @param {string} prompt - The prompt text found in the file.
   * @param {string} filePath - The path to the file.
   * @param {boolean} verbose - A flag indicating whether to log detailed information during the process.
   */
  async handleFoundPrompt(
    index: number,
    fileContent: string,
    prompt: string,
    filePath: string,
    verbose: boolean
  ): Promise<void> {
    try {
      // Determine completion type: 'complete' or 'update'
      const completionType = this.findCompletionType(fileContent, prompt);

      // Create a prompt context by extracting surrounding content
      const promptArray = await FindContext.findPromptContext(index, fileContent, prompt, verbose);

      // Create a request object with the gathered context
      const requestObject = await FormatRequest.createRequest(
        prompt,
        promptArray,
        completionType,
        verbose
      );

      // Send the request and retrieve a response from the network
      const response = await Network.doRequest(requestObject);

      // Parse the network response to get the code
      const codeData = (await FormatResponse.formatResponse(response)) as string;

      // Insert the generated code block into the file at the appropriate location
      if (completionType === 'complete') {
        await CodeInterface.insertCodeBlock(filePath, prompt, codeData);
        return;
      }

      await CodeInterface.applyCodeReplacement(filePath, codeData);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Searches a file for prompt cases or acceptance responses and processes them accordingly.
   *
   * @param {string} filePath - The path to the file to be searched.
   * @param {boolean} verbose - A flag indicating whether to log detailed information during the search.
   */
  async findPromptInFile(filePath: string, verbose: boolean = false): Promise<void> {
    try {
      // Read the file content
      const fileContent: string = fs.readFileSync(filePath, 'utf-8');

      // Identify any prompts or acceptance cases in the file
      const promptCases: UserPromptInfo[] = PromptHelper.identifyPromptCase(fileContent);

      // Process each identified case
      for (const caseItem of promptCases) {
        switch (caseItem.type) {
          case 'prompt':
            if (verbose) {
              console.log(`Prompt content: ${caseItem.content}`);
            }
            // Handle the found prompt
            await this.handleFoundPrompt(
              caseItem.lineIndex,
              fileContent,
              caseItem.content,
              filePath,
              verbose
            );
            break;
          case 'acceptance':
            if (verbose) {
              console.log(`Acceptance response: ${caseItem.content}`);
            }
            // Handle the acceptance response
            await this.handleFoundAcceptance(
              caseItem.acceptanceLine || '',
              caseItem.codeBlock,
              caseItem.content,
              fileContent,
              filePath
            );
            break;
          default:
            break;
        }
      }
    } catch (err: any) {
      console.error(`Error processing file ${filePath}:`, err.message);
    }
  }
}

// Export an instance of the FindPrompt class
export default new FindPrompt();
