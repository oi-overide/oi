const axios = require('axios');

class Network {
    /**
     * Generate code using DeepSeek Coder.
     * @param {string} prefix - The code before the target generation block.
     * @param {string} suffix - The code after the target generation block.
     * @returns {string} - The generated code response.
     */
    doRequest = async (requestData, url) => {
      try {

        console.log(requestData);

        const response = await axios.post(url, requestData);
        return response.data;  // Return the response data
    } catch (error) {
        console.error(`Error generating code: ${error.message}`);
        throw error;
    }
  };
}

module.exports = new Network();
