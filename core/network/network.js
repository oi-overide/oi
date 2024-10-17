require('dotenv').config();
const OpenAI = require('openai');

class Network {
  /**
   * Generate code using DeepSeek Coder.
   * @param {object} requestData - The request data for the OpenAI API.
   * @param {object} config - The configuration object containing `api_key` and `org_id`.
   * @returns {Promise<string>} - The generated code response.
   */
  async doRequest(requestData, config) {
    const { api_key, org_id } = config; // Extract keys from the config object

    try {
      // Ensure API key and org ID are available before making a request
      if (!api_key || !org_id) {
        throw new Error("API key or Organization ID is not provided.");
      }

      const openai = new OpenAI.OpenAI({
        apiKey: api_key,
        organization: org_id,
      });

      const completions = await openai.chat.completions.create(requestData);
      return completions;
    } catch (error) {
      console.error(`Error generating code: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new Network();
