const DirectoryHelper = require('../../helpers/help.directory');

class FormatResponse {

    async formatResponse(response, verbose = false) {
        try {
            // Get active service details (returns details like platform, apiKey, etc.)
            const activeServiceDetails = await DirectoryHelper.getActiveServiceDetails();

            // Check which platform is active and call the respective request function
            switch (activeServiceDetails.platform) {
                case 'openai':
                    return this.formatOpenAIResponse(response, verbose)

                case 'deepseek':
                    return this.formatDeepSeekResponse(response);

                default:
                    throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
            }
        } catch (error) {
            console.error(`Error in creating request: ${error.message}`);
        }
    }

    /**
     * Format the response for OpenAI models
     * @param {string} response - The response from the OpenAI API
     * @returns {string} - The code that needs to be inserted.
     */
    formatOpenAIResponse(response, verbose) {
        try {
            // Extract the content from the first choice
            const content = response.choices[0].message.content;

            // Use a regular expression to capture the code block inside ```
            const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);

            if (codeMatch && codeMatch[1]) {

                if(verbose){
                    console.log(`Code Block : ${codeMatch[1]}`);
                }

                return codeMatch[1];  // Return the extracted code
            } else {
                throw new Error("No code block found in the response");
            }
        } catch (error) {
            console.error("Error formatting OpenAI response:", error.message);
            return null;
        }
    }

    formatDeepSeekResponse(response) {
        try {
            const content = response.choices[0].message.content;
            const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
            if (codeMatch && codeMatch[1]) { 
                return codeMatch[1];  // Return the extracted code
            } else {
                throw new Error("No code block found in the response");
            }
        } catch (error) {
            console.error("Error formatting DeepSeek response:", error.message);
            return null;
        }
    }
}

module.exports = new FormatResponse();