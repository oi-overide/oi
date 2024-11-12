import { ActivePlatformDetails } from '../../models/model.config';
import { InsertionRequestInfo } from '../../models/model.prompts';
import {
  DeepSeekRequestObject,
  GeneralRequestObject,
  GroqRequestObject,
  OpenAiRequestObject
} from '../../models/model.request';

import CommandHelper from '../../utilis/util.command.config';
import { systemPromptServiceImpl } from '../service.prompts/service.system.prompt';

/**
 * The `FormatRequest` class is responsible for creating a dynamic request
 * based on the active AI service platform (OpenAI or DeepSeek). It formats
 * the prompt using `FormatPrompt` and constructs the request body accordingly.
 */
class ProcessRequest {
  /**
   * Creates a dynamic request object based on the active service platform.
   * It calls either the OpenAI or DeepSeek-specific request formatting function.
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
      switch (activeServiceDetails.platform) {
        case 'openai':
          return this.createOpenAIRequest(insertionRequest, activeServiceDetails, verbose);

        case 'deepseek':
          return this.createDeepSeekRequest(insertionRequest, activeServiceDetails, verbose);

        case 'groq':
          return this.createGroqRequest(insertionRequest, activeServiceDetails, verbose);

        default:
          throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
      }
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
      model: 'gpt-4o', // Specify the model to use
      messages: messages,
      temperature: 0.5, // Adjust temperature for creativity (lower = more deterministic)
      max_tokens: 1000, // Max tokens for the response
      n: 1, // Number of completions to generate
      stream: false, // Whether to stream results
      presence_penalty: 0, // Adjusts frequency of introducing new ideas
      frequency_penalty: 0 // Adjusts repetition
    };

    // Construct the request body for OpenAI API
    return {
      platform: activeServiceDetails,
      metadata: metadata
    };
  }

  /**
   * Creates and formats the request for DeepSeek models.
   *
   * @param prompt - The raw prompt extracted from the file.
   * @param promptArray - The array of context around the prompt.
   * @param activeServiceDetails - Details about the active service (platform, apiKey, etc.).
   * @param completionType - The type of completion being requested.
   * @returns The request object for the DeepSeek API.
   */
  async createDeepSeekRequest(
    insertionRequest: InsertionRequestInfo,
    activeServiceDetails: ActivePlatformDetails,
    verbose: boolean
  ): Promise<GeneralRequestObject> {
    // Getting the final prompt.
    const messages = await systemPromptServiceImpl.getDeepSeekSystemMessage(insertionRequest);

    if (verbose) {
      console.log(`Prompt Text : ${messages}`);
    }

    // Making metadata
    const metadata: DeepSeekRequestObject = {
      model: 'deepseek-chat',
      messages: messages
    };

    // Construct the request body for DeepSeek API
    return {
      platform: activeServiceDetails,
      metadata: metadata
    };
  }

  /**
   * Creates and formats the request for Groq models.
   *
   * @param prompt - The raw prompt extracted from the file.
   * @param promptArray - The array of context around the prompt.
   * @param activeServiceDetails - Details about the active service (platform, apiKey, etc.).
   * @param completionType - The type of completion being requested.
   * @param verbose - Whether to log the request details.
   * @returns The request object for the Groq API.
   */
  async createGroqRequest(
    insertionRequest: InsertionRequestInfo,
    activeServiceDetails: ActivePlatformDetails,
    verbose: boolean
  ): Promise<GeneralRequestObject> {
    const messages = await systemPromptServiceImpl.getGroqSystemMessage(insertionRequest);

    if (verbose) {
      console.log(`Prompt Text : ${messages}`);
    }

    const metadata: GroqRequestObject = {
      model: 'llama-3.1-70b-versatile',
      messages: messages,
      temperature: 0.94,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    };

    return {
      platform: activeServiceDetails,
      metadata: metadata
    };
  }
}

export default new ProcessRequest();
