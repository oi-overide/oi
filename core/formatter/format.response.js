const dih = require('../../helpers/help.directory');

class FormatResponse {
    model() {
        this.modelType = dih.getConfigJsonValue('model_type');
        return this;
    }

    // General method to format the response
    formatResponse(response, verbose) {
        switch (this.modelType) {
            case 'openai':
                if (verbose) {
                    console.log("Response received :", response);
                }
                return this.formatOpenAIResponse(response);
            case 'ollama':
                if (verbose) {
                    console.log("Response received :", response);
                }
                return this.formatOllamaResponse(response, verbose);
            case 'anthropic':
                if (verbose) {
                    console.log("Response received :", response);
                }
                return this.formatAnthropicResponse(response);
            default:
                throw new Error(`Unknown model type: ${this.modelType}`);
        }
    }

    /**
     * Format the response for Ollama models
     * @param {string} response - The response from the Ollama API
     * @returns {string} - The code that needs to be inserted.
     */
    formatOllamaResponse(response, verbose) {
        try {
            // Extract the content from the first choice
            const content = response;

            try {
                const data = JSON.parse(response.data.response);
                console.log(data);
            } catch (e) {
                if(verbose){
                    console.log("Response not a JSON : Searching for code", e)
                }

                // Use a regular expression to capture the code block inside ```
                const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
                if (codeMatch && codeMatch[1]) {
                    return codeMatch[1];  // Return the extracted code
                } else {
                    throw new Error("No code block found in the response");
                }
            }

        } catch (error) {
            console.error("Error formatting Ollama response:", error.message);
            return null;
        }
    }

    /**
     * Format the response for OpenAI models
     * @param {string} response - The response from the OpenAI API
     * @returns {string} - The code that needs to be inserted.
     */
    formatOpenAIResponse(response) {
        try {
            // Extract the content from the first choice
            const content = response.choices[0].message.content;

            // Use a regular expression to capture the code block inside ```
            const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);

            if (codeMatch && codeMatch[1]) {
                return codeMatch[1];  // Return the extracted code
            } else {
                throw new Error("No code block found in the response");
            }
        } catch (error) {
            console.error("Error formatting OpenAI response:", error.message);
            return null;
        }
    }
}

module.exports = new FormatResponse();