require('dotenv').config();
const OpenAI = require('openai');
// const axios = require('axios');

/**
 * The `Network` class is responsible for making API requests to different 
 * services (OpenAI, DeepSeek, and Ollama) to generate code based on the 
 * provided request data.
 */
class Network {
  /**
   * Generates code based on the active service (OpenAI, DeepSeek, or Ollama).
   * 
   * @param {object} requestData - The request data containing service details and metadata.
   * @returns {Promise<string>} - The generated code response.
   * @throws Will throw an error if no active service details are found or if there are missing credentials.
   */
  async doRequest(requestData) {
    const { activeServiceDetails } = requestData;
    
    // Validate presence of active service details
    if (!activeServiceDetails) {
      throw new Error("No active service details found.");
    }

    const { metadata } = requestData;
    const { platform } = activeServiceDetails;

    // Handle requests based on the selected platform
    switch (platform) {
      case "openai":
      return this.handleOpenAIRequest(activeServiceDetails, metadata);
      case "deepseek":
      return this.handleDeepSeekRequest(activeServiceDetails, metadata);
      default:
        throw new Error("No valid model or platform selected.");
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
  async handleOpenAIRequest(activeServiceDetails, metadata) {
    const { apiKey, orgId } = activeServiceDetails.details;

    if (!apiKey || !orgId) {
      throw new Error("API key or Organization ID missing for OpenAI.");
    }

    try {
      const openai = new OpenAI.OpenAI({ apiKey, organization: orgId });
      const completions = await openai.chat.completions.create(metadata);
      return completions; // Return the generated code from OpenAI
    } catch (error) {
      console.error(`Error generating code with OpenAI: ${error.message}`);
      throw error; // Rethrow error for handling at a higher level
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
  async handleDeepSeekRequest(activeServiceDetails, metadata) {
    const { apiKey, baseUrl } = activeServiceDetails.details;

    if (!apiKey || !baseUrl) {
      throw new Error("API key or BaseUrl missing for DeepSeek.");
    }

    try {
      const openai = new OpenAI.OpenAI({ apiKey, baseURL: baseUrl });
      const completions = await openai.chat.completions.create(metadata);
      return completions; // Return the generated code from DeepSeek
    } catch (error) {
      console.error(`Error generating code with DeepSeek: ${error.message}`);
      throw error; // Rethrow error for handling at a higher level
    }
  }
}

module.exports = new Network();
