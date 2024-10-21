const base_prompts = require('../../assets/base_prompts.json');

/**
 * The `FormatPrompt` class is responsible for constructing and formatting prompts
 * for different AI platforms (like OpenAI and DeepSeek). It uses a base prompt template
 * and dynamically fills in context based on the file content around the prompt.
 *
 * Responsibilities:
 * - Fetch the active platform's details (OpenAI, DeepSeek).
 * - Generate a formatted prompt based on the active platform.
 * - Load and process a base prompt template from configuration files.
 * - Dynamically construct context around the insertion point for prompt creation.
 */
class FormatPrompt {
    /**
     * Creates and formats a prompt for OpenAI models.
     *
     * @param {Array} contextArray - The array of context around the prompt.
     * @param {string} prompt - The raw prompt text.
     * @returns {Promise<string>} The formatted OpenAI prompt.
     */
    async getOpenAiPrompt(contextArray, prompt) {
        try {
            // Load the base prompt template asynchronously
            const promptTemplate = await this.loadBasePromptTemplate('openai'); // Specify the platform if needed

            // Create the context string using surrounding content
            const context = this.getBaseContext(contextArray);

            // Replace placeholders with actual content
            const promptText = promptTemplate
                .replace('${context}', context)
                .replace('${prompt}', prompt);

            return promptText;
        } catch (error) {
            console.error(`Error generating OpenAI prompt: ${error.message}`);
            throw error; // Re-throw the error for further handling
        }
    }

    /**
     * Creates and formats a prompt for DeepSeek models.
     *
     * @param {Array} contextArray - The array of context around the prompt.
     * @param {string} prompt - The raw prompt text.
     * @returns {string} The formatted DeepSeek prompt.
     */
    async getDeepSeekPrompt(contextArray, prompt) {
        try {
            // Load the base prompt template asynchronously
            const promptTemplate = await this.loadBasePromptTemplate('deepseek'); // Specify the platform if needed

            // Create the context string using surrounding content
            const context = this.getBaseContext(contextArray);

            // Replace placeholders with actual content
            const promptText = promptTemplate
                .replace('${context}', context)
                .replace('${prompt}', prompt);

            return promptText;
        } catch (error) {
            console.error(`Error generating DeepSeek prompt: ${error.message}`);
            throw error; // Re-throw the error for further handling
        }
    }

    /**
     * Constructs the context string based on the lines around the insertion point.
     *
     * @param {Array} contextArray - The array containing the imports, pre-context, and post-context.
     * @returns {string} The constructed context string.
     */
    getBaseContext(contextArray) {
        const context = `<First 10 lines of the file>${contextArray[0]}<10 lines before the insertion>${contextArray[1]}<10 lines after the insertion>${contextArray[3]}`;
        return context;
    }

    /**
    * Loads the base prompt template from the `base_prompts.json` file.
    *
    * @param {string} platform - The platform for which to load the base prompt (e.g., 'openai', 'deepseek').
    * @returns {Promise<string>} The base prompt template text for the specified platform.
    */
    async loadBasePromptTemplate(platform) {
        try {
            // Check if the specified platform has a prompt
            if (!base_prompts[platform]) {
                throw new Error(`Base prompt not found for platform: ${platform}`);
            }

            // Return the base prompt for the specified platform
            return base_prompts[platform].basePrompt;
        } catch (error) {
            console.error(`Error loading base prompt: ${error.message}`);
            throw error; // Re-throw the error for further handling
        }
    }
}

module.exports = new FormatPrompt();
