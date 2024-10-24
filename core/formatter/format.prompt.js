const promptStructure = require('../../assets/prompt.structure.json');

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
     * @param {string} completionType - The type of completion (e.g., 'complete' or 'update').
     * @returns {Promise<string>} The formatted OpenAI prompt.
     */
    async getOpenAiPrompt(contextArray, prompt, completionType) {
        try {
            const platform = 'openai';

            // In all the cases load the system prompt
            const systemPrompt = promptStructure[platform].systemMessage;
            const codeContext = this.getCodeContext(contextArray, prompt);
            const instructions = this.getInstructions(completionType, platform);

            let format = '';
            let contextPrompt = '';

            // If the completion type is 'update', load the context and update prompt
            if (completionType === 'update') {
                contextPrompt = promptStructure[platform].update.context;
                format = promptStructure[platform].update.format;
                const finalPrompt = `${systemPrompt}${contextPrompt}${codeContext}\n${instructions}\n${format}`; 
                return finalPrompt;
            }

            contextPrompt = promptStructure[platform].complete.context;
            format = promptStructure[platform].complete.format;
            const finalPrompt = `${systemPrompt}${contextPrompt}${codeContext}\n${instructions}\n${format}`;
            return finalPrompt;
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
     * @param {string} completionType - The type of completion (e.g., 'complete' or 'update').
     * @returns {Promise<string>} The formatted DeepSeek prompt.
     */
    async getDeepSeekPrompt(contextArray, prompt, completionType) {
        try {
            const platform = 'deepseek';

            // In all the cases load the system prompt
            const systemPrompt = promptStructure[platform].systemMessage;
            const codeContext = this.getCodeContext(contextArray, prompt);
            const instructions = this.getInstructions(completionType, platform);

            let format = '';
            let contextPrompt = '';

            // If the completion type is 'update', load the context and update prompt
            if (completionType === 'update') {
                contextPrompt = promptStructure[platform].update.context;
                format = promptStructure[platform].update.format;
                const finalPrompt = `${systemPrompt}${contextPrompt}${codeContext}\n${instructions}\n${format}`;
                return finalPrompt;
            }

            contextPrompt = promptStructure[platform].complete.context;
            format = promptStructure[platform].complete.format;
            const finalPrompt = `${systemPrompt}${contextPrompt}${codeContext}\n${instructions}\n${format}`;
            return finalPrompt;
        } catch (error) {
            console.error(`Error generating DeepSeek prompt: ${error.message}`);
            throw error; // Re-throw the error for further handling
        }
    }

    getCodeContext(contextArray, prompt) {
        return `File Content :\n${contextArray[0]}\n user prompt :${prompt}\n`;
    }

    getInstructions(completionType, platform){
        let completion = ``;
        if(completionType === "update"){
            const instructionList = promptStructure[platform].update.instructions;
            completion = instructionList.join('');
            return completion;
        }
        const instructionList = promptStructure[platform].complete.instructions;
        completion = instructionList.join('');
        return completion;
    }
}

module.exports = new FormatPrompt();
