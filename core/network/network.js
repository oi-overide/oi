require('dotenv').config();
const OpenAI = require('openai');
const axios = require('axios');

class Network {
  /**
   * Generate code based on the active service (OpenAI, DeepSeek, or Ollama).
   * @param {object} requestData - The request data for the API.
   * @returns {Promise<string>} - The generated code response.
   */
  async doRequest(requestData) {
    const { activeServiceDetails } = requestData;

    if (!activeServiceDetails) {
      throw new Error("No active service details found.");
    }

    const {metadata} = requestData;
    const { platform } = activeServiceDetails;
    const { apiKey, orgId, baseUrl, port } = activeServiceDetails.details;

    // Handle OpenAI requests
    if (platform === "openai") {
      if (!apiKey || !orgId) {
        throw new Error("API key or Organization ID missing for OpenAI.");
      }

      try {
        const openai = new OpenAI.OpenAI({
          apiKey: apiKey,
          organization: orgId,
        });

        const completions = await openai.chat.completions.create(metadata);
        return completions;
      } catch (error) {
        console.error(`Error generating code with OpenAI: ${error.message}`);
        throw error;
      }
    }

    // Handle DeepSeek requests
    if (platform === 'deepseek') {
      if (!apiKey || !baseUrl) {
        throw new Error("API key or BaseUrl missing for DeepSeek.");
      }

      // Uncomment the following for actual API call with OpenAI package      
      try {
        const openai = new OpenAI.OpenAI({
          apiKey: apiKey,
          baseURL: baseUrl,
        });
        const completions = await openai.chat.completions.create(metadata);
        return completions;
      } catch (error) {
        console.error(`Error generating code with OpenAI: ${error.message}`);
        throw error;
      }
    }

    // Handle Ollama requests
    if (platform === 'ollama') {
      if (!port) {
        throw new Error("Port missing for Ollama.");
      }

      // Uncomment the following for actual API call with axios
      try {
        const response = await axios.post(`http://localhost:${port}/generate`, metadata);
        return response.data;
      } catch (error) {
        console.error(`Error generating code with Ollama: ${error.message}`);
        throw error;
      }
    }

    throw new Error("No valid model or platform selected.");
  }
}

module.exports = new Network();
