const axios = require('axios');
const OpenAI = require('openai');
const dih = require('../../helpers/help.directory');

require('dotenv').config();

class Network {
    /**
     * Generate code using DeepSeek Coder.
     * @param {string} prefix - The code before the target generation block.
     * @param {string} suffix - The code after the target generation block.
     * @returns {string} - The generated code response.
     */
    doRequest = async (requestData, url) => {
      try {
        // Get the model type from oi-config.json
        const modelType = dih.getConfigJsonValue('model_type');

        if(modelType == "openai"){
          const openai = new OpenAI.OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            organization: process.env.OPENAI_ORG_ID,
          });

          const completions = await openai.chat.completions.create(requestData);
          return completions;
        }

        const response = await axios.post(url, requestData);
        return response;  // Return the response data
      } catch (error) {
          console.error(`Error generating code: ${error.message}`);
          throw error;
      }
  };
}

module.exports = new Network();
