const DirectoryHelper = require('../helpers/help.directory');
const FormatPrompt = require('./format.prompt');

/**
 * The `FormatRequest` class is responsible for creating a dynamic request 
 * based on the active AI service platform (OpenAI or DeepSeek). It formats 
 * the prompt using `FormatPrompt` and constructs the request body accordingly.
 */
class FormatRequest {

    /**
     * Creates a dynamic request object based on the active service platform.
     * It calls either the OpenAI or DeepSeek-specific request formatting function.
     * 
     * @param {string} prompt - The raw prompt extracted from the file.
     * @param {Array} promptArray - The array of context around the prompt.
     * @param {boolean} verbose - Whether to log the request creation process.
     * @returns {Object} The formatted request object for the active service.
     */
    async createRequest(prompt, promptArray, completionType, verbose = false) {
        try {
            // Fetch details about the active AI service (platform, API key, etc.)
            const activeServiceDetails = await DirectoryHelper.getActiveServiceDetails();

            // Determine which platform is active and create the appropriate request
            switch (activeServiceDetails.platform) {
                case 'openai':
                    return this.createOpenAIRequest(prompt, promptArray, activeServiceDetails, completionType, verbose);

                case 'deepseek':
                    return this.createDeepSeekRequest(prompt, promptArray, activeServiceDetails, completionType);

                default:
                    throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
            }
        } catch (error) {
            console.error(`Error in creating request: ${error.message}`);
        }
    }

    /**
     * Creates and formats the request for OpenAI models.
     * 
     * @param {string} prompt - The raw prompt extracted from the file.
     * @param {Array} promptArray - The array of context around the prompt.
     * @param {Object} activeServiceDetails - Details about the active service (platform, apiKey, etc.).
     * @param {boolean} verbose - Whether to log the request details.
     * @returns {Object} The request object for the OpenAI API.
     */
    async createOpenAIRequest(prompt, promptArray, activeServiceDetails, completionType, verbose) {
        const finalPrompt = await FormatPrompt.getOpenAiPrompt(promptArray, prompt, completionType);

        if (verbose) {
            console.log(`Prompt Text : ${finalPrompt}`);
        }

        // Construct the request body for OpenAI API
        return {
            activeServiceDetails,
            "metadata": {
                model: "gpt-4o",          // Specify the model to use
                messages: [
                    { role: 'system', content: 'You are a coding assistant api.' },
                    { role: 'user', content: finalPrompt },
                ],
                temperature: 0.7,          // Adjust temperature for creativity (lower = more deterministic)
                max_tokens: 1000,          // Max tokens for the response
                n: 1,                      // Number of completions to generate
                stream: false,             // Whether to stream results
                presence_penalty: 0,       // Adjusts frequency of introducing new ideas
                frequency_penalty: 0,      // Adjusts repetition
            },
        };
    }

    /**
     * Creates and formats the request for DeepSeek models.
     * 
     * @param {string} prompt - The raw prompt extracted from the file.
     * @param {Array} promptArray - The array of context around the prompt.
     * @param {Object} activeServiceDetails - Details about the active service (platform, apiKey, etc.).
     * @returns {Object} The request object for the DeepSeek API.
     */
    async createDeepSeekRequest(prompt, promptArray, activeServiceDetails, completionType) {
        try {
            const finalPrompt = await FormatPrompt.getDeepSeekPrompt(promptArray, prompt, completionType);
            const messages = [{ "role": "system", "content": finalPrompt }, { "role": "user", "content": prompt }];

            // Construct the request body for DeepSeek API
            return {
                activeServiceDetails,
                "metadata": {
                    messages: messages,
                    model: "deepseek-chat",
                }
            };
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new FormatRequest();
