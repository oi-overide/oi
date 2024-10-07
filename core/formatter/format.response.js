const dih = require('../../helpers/help.directory');

class FormatResponse {
    constructor() {  // Initialize the FormatResponse class with the provided options
        this.config = dih.getConfigJsonValue();
    }

    // General method to format the response
    formatResponse(response) {
        switch (this.modelType) {
            case 'openai':
                return this.createOpenAIResponse(response);

            case 'ollama':
                return this.createOllamaResponse(response);

            case 'anthropic':
                return this.createAnthropicResponse(response);

            default:
                throw new Error(`Unknown model type: ${this.modelType}`);
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