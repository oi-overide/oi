// const axios = require('axios');

class Network {
    /**
     * Generate code using DeepSeek Coder.
     * @param {string} prefix - The code before the target generation block.
     * @param {string} suffix - The code after the target generation block.
     * @returns {string} - The generated code response.
     */
    doRequest = async (object, url) => {
        try {
            console.log(object);
            console.log(url);
            console.log(prompt);

            return {
                "id": "chatcmpl-xyz789",
                "object": "chat.completion",
                "created": 1687030836,
                "model": "gpt-4",
                "choices": [
                  {
                    "index": 0,
                    "message": {
                      "role": "assistant",
                      "content": "```javascript\n" +
                                 "function fibonacci(n) {\n" +
                                 "    const fibSeries = [0, 1];\n" +
                                 "    for (let i = 2; i < n; i++) {\n" +
                                 "        fibSeries.push(fibSeries[i - 1] + fibSeries[i - 2]);\n" +
                                 "    }\n" +
                                 "    return fibSeries;\n" +
                                 "}\n" +
                                 "\n" +
                                 "```"
                    },
                    "finish_reason": "stop"
                  }
                ],
                "usage": {
                  "prompt_tokens": 10,
                  "completion_tokens": 78,
                  "total_tokens": 88
                }
              };
              

            // Make the request to DeepSeek API
            // const response = await axios.post(url, object);

            // console.log(response.data.response);

            // return response.data.response;  // Return the generated code
        } catch (error) {
            console.error(`Error generating code: ${error.message}`);
            throw error;
        }
    };

}

module.exports = new Network();
