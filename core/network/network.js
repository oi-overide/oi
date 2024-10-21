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
        console.log("activeServiceDetails", activeServiceDetails);
        console.log("metadata", metadata);
        return {
          "id": "chatcmpl-1234567890abcdefg",
          "object": "chat.completion",
          "created": 1678901234,
          "model": "gpt-4",
          "choices": [
            {
              "message": {
                "role": "assistant",
                "content": "Here is a simple Python function that calculates the factorial of a number:\n\n```python\n\ndef factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n - 1)\n\n# Example usage:\nprint(factorial(5))  # Output: 120\n```"
              },
              "finish_reason": "stop",
              "index": 0
            }
          ],
          "usage": {
            "prompt_tokens": 15,
            "completion_tokens": 50,
            "total_tokens": 65
          }
        };
      // return this.handleOpenAIRequest(activeServiceDetails, metadata);
      case "deepseek":
        console.log("activeServiceDetails", activeServiceDetails);
        console.log("metadata", metadata);
        console.log("activeServiceDetails", activeServiceDetails);
        console.log("metadata", metadata);
        return {
          "id": "chatcmpl-1234567890abcdefg",
          "object": "chat.completion",
          "created": 1678901234,
          "model": "gpt-4",
          "choices": [
            {
              "message": {
                "role": "assistant",
                "content": "Here is a simple Python function that calculates the factorial of a number:\n\n```python\n\ndef factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n - 1)\n\n# Example usage:\nprint(factorial(5))  # Output: 120\n```"
              },
              "finish_reason": "stop",
              "index": 0
            }
          ],
          "usage": {
            "prompt_tokens": 15,
            "completion_tokens": 50,
            "total_tokens": 65
          }
        };
      // return this.handleDeepSeekRequest(activeServiceDetails, metadata);
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
