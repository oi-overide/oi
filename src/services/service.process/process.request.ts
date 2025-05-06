import { ActivePlatformDetails } from '../../models/model.config';
import { InsertionRequestInfo } from '../../models/model.prompts';
import { GeneralRequestObject, OpenAiRequestObject } from '../../models/model.request';

import CommandHelper from '../../utilis/util.command.config';
import { systemPromptServiceImpl } from '../service.prompts/service.system.prompt';

/**
 * The `FormatRequest` class is responsible for creating a dynamic request
 * based on the active AI service platform (OpenAI). It formats
 * the prompt using `FormatPrompt` and constructs the request body accordingly.
 */
class ProcessRequest {
  /**
   * Creates a dynamic request object based on the active service platform.
   * It calls the OpenAI-specific request formatting function.
   *
   * @param prompt - The raw prompt extracted from the file.
   * @param promptArray - The array of context around the prompt.
   * @param completionType - The type of completion being requested.
   * @param verbose - Whether to log the request creation process.
   * @returns The formatted request object for the active service.
   */
  async createRequest(
    insertionRequest: InsertionRequestInfo,
    verbose = false
  ): Promise<GeneralRequestObject | void> {
    try {
      // Fetch details about the active AI service (platform, API key, etc.)
      const activeServiceDetails = await CommandHelper.getActiveServiceDetails();

      if (activeServiceDetails === null) {
        throw new Error('No active service found.');
      }

      // Determine which platform is active and create the appropriate request
      if (activeServiceDetails.platform === 'openai') {
        return this.createOpenAIRequest(insertionRequest, activeServiceDetails, verbose);
      }
      throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in creating request: ${error.message}`);
      }
    }
  }

  /**
   * Creates and formats the request for OpenAI models.
   *
   * @param prompt - The raw prompt extracted from the file.
   * @param promptArray - The array of context around the prompt.
   * @param activeServiceDetails - Details about the active service (platform, apiKey, etc.).
   * @param completionType - The type of completion being requested.
   * @param verbose - Whether to log the request details.
   * @returns The request object for the OpenAI API.
   */
  async createOpenAIRequest(
    insertionRequest: InsertionRequestInfo,
    activeServiceDetails: ActivePlatformDetails,
    verbose: boolean
  ): Promise<GeneralRequestObject> {
    const messages = await systemPromptServiceImpl.getOpenAiSystemMessage(insertionRequest);

    if (verbose) {
      console.log(`Prompt Text : ${messages}`);
    }

    const metadata: OpenAiRequestObject = {
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.5,
      max_tokens: 2500,
      n: 1,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 0,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'changes',
          schema: {
            type: 'object',
            properties: {
              changes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    find: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    replace: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  },
                  required: ['find', 'replace'],
                  additionalProperties: false
                }
              }
            },
            required: ['changes'],
            additionalProperties: false
          }
        }
      }
    };

    // Construct the request body for OpenAI API
    return {
      platform: activeServiceDetails,
      metadata: metadata
    };
  }
}

export default new ProcessRequest();
