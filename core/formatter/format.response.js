const DirectoryHelper = require('../helpers/help.directory');

/**
 * The `FormatResponse` class is responsible for formatting the response received from
 * AI service platforms like OpenAI and DeepSeek. It extracts code blocks from the response
 * content and returns them for further processing.
 */
class FormatResponse {

    /**
     * Formats the response based on the active service platform.
     * It calls either the OpenAI or DeepSeek-specific formatting function.
     * 
     * @param {Object} response - The API response object.
     * @param {boolean} verbose - Whether to log the formatting process.
     * @returns {string|null} The formatted code block extracted from the response.
     */
    async formatResponse(response, verbose = false) {
        try {
            // Fetch details about the active AI service (platform, API key, etc.)
            const activeServiceDetails = await DirectoryHelper.getActiveServiceDetails();

            // Determine which platform is active and format the response accordingly
            switch (activeServiceDetails.platform) {
                case 'openai':
                    return this.formatOpenAIResponse(response, verbose);

                case 'deepseek':
                    return this.formatDeepSeekResponse(response);

                default:
                    throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
            }
        } catch (error) {
            console.error(`Error in formatting response: ${error.message}`);
            return null;
        }
    }

    /**
     * Formats the response from OpenAI models by extracting the code block.
     * 
     * @param {Object} response - The response from the OpenAI API.
     * @param {boolean} verbose - Whether to log details of the extracted code.
     * @returns {string|null} The extracted code block, or null if no code block is found.
     */
    formatOpenAIResponse(response, verbose) {
        try {
            // Extract the content from the first choice in the response
            const content = response.choices[0].message.content;

            // Use a regular expression to capture the code block inside triple backticks ```
            const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);

            if (codeMatch && codeMatch[1]) {
                if (verbose) {
                    console.log(`Code Block: ${codeMatch[1]}`);
                }
                return codeMatch[1];  // Return the extracted code
            } else {
                throw new Error("No code block found in the OpenAI response");
            }
        } catch (error) {
            console.error("Error formatting OpenAI response:", error.message);
            return null;
        }
    }

    /**
     * Formats the response from DeepSeek models by extracting the code block.
     * 
     * @param {Object} response - The response from the DeepSeek API.
     * @returns {string|null} The extracted code block, or null if no code block is found.
     */
    formatDeepSeekResponse(response) {
        try {
            // Extract the content from the first choice in the response
            const content = response.choices[0].message.content;

            // Use a regular expression to capture the code block inside triple backticks ```
            const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);

            if (codeMatch && codeMatch[1]) {
                return codeMatch[1];  // Return the extracted code
            } else {
                throw new Error("No code block found in the DeepSeek response");
            }
        } catch (error) {
            console.error("Error formatting DeepSeek response:", error.message);
            return null;
        }
    }
}

module.exports = new FormatResponse();
