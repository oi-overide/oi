import fs from 'fs';
import userPromptService from '../services/service.prompts/service.user.prompt';
import processResponse from '../services/service.process/process.response';
import serviceDev from '../services/service.dev';
import serviceNetwork from '../services/service.network';
import processRequest from '../services/service.process/process.request';

import { InsertionRequestInfo, InsertionResponseInfo } from '../models/model.prompts';
import { GeneralRequestObject } from '../models/model.request';

abstract class StartCommandHandler {
  abstract handleFoundAcceptance(
    insertionResponse: InsertionResponseInfo,
    verbose: boolean
  ): Promise<void>;

  abstract handleFoundPrompt(
    insertionRequest: InsertionRequestInfo,
    verbose: boolean
  ): Promise<void>;

  abstract findPromptInFile(filePath: string, verbose: boolean): Promise<void>;
}

class StartCommandHandlerImpl extends StartCommandHandler {
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
    insertionResponse: InsertionResponseInfo,
    verbose: boolean
  ): Promise<void> {
    const response = insertionResponse.insertionResponse;

    // Remove the code block if the user rejects it
    if (response === 'rejected') {
      if (verbose) {
        console.log('Insertion Rejected');
      }
      await serviceDev.removeCodeBlock(insertionResponse);
      return;
    }

    // Remove the acceptance message if the user accepts the suggestion
    if (response === 'accepted') {
      if (verbose) {
        console.log('Insertion Accepted');
      }
      await serviceDev.removeAcceptanceMessage(
        insertionResponse.filePath,
        insertionResponse.fileContent,
        insertionResponse.acceptanceLine ? insertionResponse.acceptanceLine : ''
      );
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
  async handleFoundPrompt(insertionRequest: InsertionRequestInfo, verbose: boolean): Promise<void> {
    try {
      // TODO : Create prompt context using dependency graph.

      // Create a request object with the gathered context
      const generalRequestObject: GeneralRequestObject | void = await processRequest.createRequest(
        insertionRequest,
        verbose
      );

      if (!generalRequestObject) {
        throw new Error('Failed to create request object');
      }

      // Send the request and retrieve a response from the network
      const response: string = await serviceNetwork.doRequest(generalRequestObject);
      // Parse the network response to get the code
      const replacementBlock = await processResponse.formatResponse(response);

      if (replacementBlock === null) {
        console.log('No replacement bloc found during formatting the response');
        return;
      }

      // Insert the generated code block into the file at the appropriate location
      await serviceDev.applyCodeReplacement(insertionRequest.filePath, replacementBlock);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        throw err;
      }
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

      const insertionRequests = (await userPromptService.findInsertionRequests(
        filePath,
        fileContent,
        verbose
      )) as InsertionRequestInfo[];

      const insertionResponses = (await userPromptService.findInsertionResponses(
        filePath,
        fileContent,
        verbose
      )) as InsertionResponseInfo[];

      for (const insertionResponse of insertionResponses) {
        if (verbose) {
          console.log(insertionResponse);
        }
        // Handle the found prompt
        await this.handleFoundAcceptance(insertionResponse, verbose);
      }

      for (const insertionRequest of insertionRequests) {
        if (verbose) {
          console.log(insertionRequest);
        }
        await this.handleFoundPrompt(insertionRequest, verbose);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Error processing file ${filePath}:`, err.message);
        throw err;
      }
    }
  }
}

export default new StartCommandHandlerImpl();
