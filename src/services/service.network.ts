import OpenAI from 'openai';
import { GeneralRequestObject, OpenAiRequestObject } from '../models/model.request';
import { ChatCompletion } from 'openai/resources/chat/completions';
import { ActivePlatformDetails } from '../models/model.config';

import * as dotenv from 'dotenv';

dotenv.config();

abstract class NetworkService {
  abstract getCodeEmbedding(
    codeSnippet: string,
    activeServiceDetails: ActivePlatformDetails
  ): Promise<number[]>;

  abstract doRequest(requestData: GeneralRequestObject): Promise<string>;

  abstract handleOpenAIRequest(
    activeServiceDetails: ActivePlatformDetails,
    metadata: OpenAiRequestObject
  ): Promise<string>;
}

/**
 * The `Network` class is responsible for making API requests to OpenAI
 * to generate code based on the provided request data.
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
        model: 'text-embedding-3-small', // Choose the embedding model
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
   * Generates code based on OpenAI service.
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
    if (platform === 'openai') {
      return this.handleOpenAIRequest(activeServiceDetails, metadata as OpenAiRequestObject);
    }
    throw new Error('No valid model or platform selected.');
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
      console.log(completions.choices[0]);
      return (completions.choices[0] as ChatCompletion.Choice).message.content || ''; // Return the content string from OpenAI completion
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating code with OpenAI: ${error.message}`);
        throw error; // Rethrow error for handling at a higher level
      }
      throw error;
    }
  }
}

export default new NetworkServiceImpl();
