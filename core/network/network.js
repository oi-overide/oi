require('dotenv').config();
const OpenAI = require('openai');

class Network {
  /**
   * Generate code using DeepSeek Coder.
   * @param {string} prefix - The code before the target generation block.
   * @param {string} suffix - The code after the target generation block.
   * @returns {string} - The generated code response.
   */
  doRequest = async (requestData) => {
    try {
      const openai = new OpenAI.OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID,
      });

      const completions = await openai.chat.completions.create(requestData);
      return completions;



    } catch (error) {
      console.error(`Error generating code: ${error.message}`);
      throw error;
    }
  };
}

module.exports = new Network();
