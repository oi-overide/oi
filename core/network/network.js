const axios = require('axios');

class Network {
    /**
     * Generate code using DeepSeek Coder.
     * @param {string} prefix - The code before the target generation block.
     * @param {string} suffix - The code after the target generation block.
     * @returns {string} - The generated code response.
     */
    doRequest = async (object, url) => {
        try {
            // Load configuration from oi-config.json
            // const host = await dih.getConfigJsonValue('host');  // Custom URL for local LLM
            // const port = await dih.getConfigJsonValue('port');  // Custom port for local LLM
            // const model = await dih.getConfigJsonValue('model');  // Model name for local LLM


            // Create the URL dynamically from host and port
            // const url = `http://${host}:${port}/api/generate`;

            // Prepare the prompt with <PRE> <SUF> <MID> structure for code infilling
            // const prompt = `<PRE>${prefix}<SUF>${suffix}<MID>${mid}`;

            console.log(prompt);

            // {
            //     model: model,  // Use the model from oi-config
            //     prompt: prompt,  // Pass the infilling prompt with tags
            //     stream: false,  // Disable streaming
            //     keep_alive: 1000,
            //     options: {
            //         temperature: 0.5,  // Adjust randomness as needed
            //         max_tokens: 1000,  // Limit the response length
            //         presence_penalty: 0,
            //         frequency_penalty: 0,
            //     }
            // }

            // Make the request to DeepSeek API
            const response = await axios.post(url, object);

            console.log(response.data.response);

            return response.data.response;  // Return the generated code
        } catch (error) {
            console.error(`Error generating code: ${error.message}`);
            throw error;
        }
    };

}

module.exports = new Network();
