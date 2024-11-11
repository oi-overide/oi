import OpenAI from 'openai';
import Groq from 'groq-sdk';

import {
  DeepSeekRequestObject,
  GeneralRequestObject,
  GroqRequestObject,
  OpenAiRequestObject
} from '../models/model.request';
import {
  ChatCompletion,
  ChatCompletionMessageParam as OpenAIChatCompletionMessageParam
} from 'openai/resources/chat/completions';
import { ActivePlatformDetails } from '../models/model.config';
import { ChatCompletionMessageParam as GroqChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

import * as dotenv from 'dotenv';

dotenv.config();

abstract class NetworkService {
  abstract doRequest(requestData: GeneralRequestObject): Promise<string>;

  abstract handleOpenAIRequest(
    activeServiceDetails: ActivePlatformDetails,
    metadata: OpenAiRequestObject
  ): Promise<string>;

  abstract handleDeepSeekRequest(
    activeServiceDetails: ActivePlatformDetails,
    metadata: DeepSeekRequestObject
  ): Promise<string>;

  abstract handleGroqRequest(
    activeServiceDetails: ActivePlatformDetails,
    metadata: GroqRequestObject
  ): Promise<string>;
}

/**
 * The `Network` class is responsible for making API requests to different
 * services (OpenAI, DeepSeek, and Groq) to generate code based on the
 * provided request data.
 */
class NetworkServiceImpl extends NetworkService {
  /**
   *
   * @param codeSnippet - The string code from the dependency graph.
   * @param activeServiceDetails - The API key and other metadata.
   * @returns {Promise<number[]>} The generated embedding.
   */
  async getCodeEmbedding(
    codeSnippet: string,
    activeServiceDetails: ActivePlatformDetails
  ): Promise<number[]> {
    try {
      const { apiKey, orgId } = activeServiceDetails.platformConfig;
      const openai = new OpenAI.OpenAI({ apiKey, organization: orgId });
      // Call the OpenAI API to get embeddings
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002', // Choose the embedding model
        input: codeSnippet // The input text (code snippet)
      });

      // Extract the embedding from the response
      const embedding = (response.data[0] as OpenAI.Embedding).embedding; // This is an array of numbers
      return embedding;
    } catch (error) {
      console.error('Error fetching embedding:', error);
      throw error;
    }
  }

  /**
   * Generates code based on the active service (OpenAI, DeepSeek, or Groq).
   *
   * @param {object} requestData - The request data containing service details and metadata.
   * @returns {Promise<string>} - The generated code response.
   * @throws Will throw an error if no active service details are found or if there are missing credentials.
   */
  async doRequest(requestData: GeneralRequestObject): Promise<string> {
    const activeServiceDetails: ActivePlatformDetails = requestData.platform;
    const metadata = requestData.metadata;

    // Validate presence of active service details
    if (!activeServiceDetails) {
      throw new Error('No active service details found.');
    }

    const platform = activeServiceDetails.platform;

    // Handle requests based on the selected platform
    switch (platform) {
      case 'openai':
        return this.handleOpenAIRequest(activeServiceDetails, {
          ...metadata,
          messages: metadata.messages as OpenAIChatCompletionMessageParam[]
        });
      case 'deepseek':
        return this.handleDeepSeekRequest(activeServiceDetails, {
          ...metadata,
          messages: metadata.messages as OpenAIChatCompletionMessageParam[]
        });
      case 'groq':
        return this.handleGroqRequest(activeServiceDetails, {
          ...metadata,
          messages: metadata.messages as GroqChatCompletionMessageParam[]
        });
      default:
        throw new Error('No valid model or platform selected.');
    }
  }

  /**
   * Handles requests to the OpenAI service.
   *
   * @param {object} activeServiceDetails - The details of the active OpenAI service.
   * @param {object} metadata - The metadata for the API request.
   * @returns {Promise<string>} - The generated code response from OpenAI.
   * @throws Will throw an error if the API key or organization ID is missing.
   */
  async handleOpenAIRequest(
    activeServiceDetails: ActivePlatformDetails,
    metadata: OpenAiRequestObject
  ): Promise<string> {
    const { apiKey, orgId } = activeServiceDetails.platformConfig;

    if (!apiKey || !orgId) {
      throw new Error('API key or Organization ID missing for OpenAI.');
    }

    try {
      const openai = new OpenAI.OpenAI({ apiKey, organization: orgId });
      const completions: ChatCompletion = await openai.chat.completions.create({
        ...metadata,
        stream: false
      });
      return (completions.choices[0] as ChatCompletion.Choice).message.content || ''; // Return the content string from OpenAI completion
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating code with OpenAI: ${error.message}`);
        throw error; // Rethrow error for handling at a higher level
      }
      throw error;
    }
  }

  /**
   * Handles requests to the DeepSeek service.
   *
   * @param {object} activeServiceDetails - The details of the active DeepSeek service.
   * @param {object} metadata - The metadata for the API request.
   * @returns {Promise<string>} - The generated code response from DeepSeek.
   * @throws Will throw an error if the API key or base URL is missing.
   */
  async handleDeepSeekRequest(
    activeServiceDetails: ActivePlatformDetails,
    metadata: DeepSeekRequestObject
  ): Promise<string> {
    const { apiKey, baseUrl } = activeServiceDetails.platformConfig;

    if (!apiKey || !baseUrl) {
      throw new Error('API key or BaseUrl missing for DeepSeek.');
    }

    try {
      const openai = new OpenAI.OpenAI({ apiKey, baseURL: baseUrl });
      const completions = await openai.chat.completions.create({
        ...metadata,
        stream: false
      });
      return (completions.choices[0] as ChatCompletion.Choice).message.content || ''; // Return the content string from DeepSeek completion
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating code with DeepSeek: ${error.message}`);
        throw error; // Rethrow error for handling at a higher level
      }
      throw error;
    }
  }

  /**
   * Handles requests to the Groq service.
   *
   * @param {object} activeServiceDetails - The details of the active Groq service.
   * @param {object} metadata - The metadata for the API request.
   * @returns {Promise<string>} - The generated code response from Groq.
   * @throws Will throw an error if the API key is missing.
   */
  async handleGroqRequest(
    activeServiceDetails: ActivePlatformDetails,
    metadata: GroqRequestObject
  ): Promise<string> {
    const { apiKey } = activeServiceDetails.platformConfig;

    if (!apiKey) {
      throw new Error('API key missing for Groq.');
    }

    try {
      const groq = new Groq({ apiKey });
      const completions = await groq.chat.completions.create({
        ...metadata,
        stream: false
      });
      return (completions.choices[0] as ChatCompletion.Choice).message.content || ''; // Return the content string from Groq completion
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating code with Groq: ${error.message}`);
        throw error;
      }
      throw error;
    }
  }
}

export default new NetworkServiceImpl();
