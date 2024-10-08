const dih = require('../../helpers/help.directory')


class FormatRequest {
    model() {
        this.modelType = dih.getConfigJsonValue('model_type');
        return this;
    }

    // get the request url
    getUrl() {
        switch (this.modelType) {
            case 'openai':
                return `USING_FUNCTIONALITY`;

            case 'ollama':
                return `http://${dih.getConfigJsonValue('host')}:${dih.getConfigJsonValue('port')}/api/generate`;

            case 'anthropic':
                return `http://${dih.getConfigJsonValue('host')}:${dih.getConfigJsonValue('port')}/api/generate`;

            default:
                throw new Error(`Unknown model type: ${this.modelType}`);
        }
    }

    // General method to format the request
    formatRequest(prompt, options = {}) {
        switch (this.modelType) {
            case 'openai':
                return this.createOpenAIRequest(prompt, options);

            case 'ollama':
                return this.createOllamaRequest(prompt, options);

            case 'anthropic':
                return this.createAnthropicRequest(prompt, options);

            default:
                throw new Error(`Unknown model type: ${this.modelType}`);
        }
    }

    // Format request for OpenAI models
    createOpenAIRequest(prompt, isDependencyGraph = false) {
        // Get the model name from oi-config.json
        const model = dih.getConfigJsonValue('model');

        if (!model) {
            throw new Error('Model not specified in oi-config.json');
        }

        let finalPrompt = prompt;

        // Skip infilling prompt when generating the dependency graph
        if (!isDependencyGraph) {
            // Assuming you have some kind of infilling logic similar to Ollama's PRE, SUF, and MID structure
            // Example infilling prompt structure (you would define `prefix`, `suffix`, `mid` elsewhere)
            // finalPrompt = `<PRE>${prefix}<SUF>${suffix}<MID>${mid}`;

            // For OpenAI, you can manually simulate infilling by crafting a structured prompt
            // e.g., "Complete the code based on the following context:"
            finalPrompt = `Complete the code based on the following context:\n\n${prompt}\n\nFill in the missing part here.`;
        }

        // Construct the request body for OpenAI API
        return {
            model: model,
            messages: [{ role: 'user', content: finalPrompt }],
            temperature: 0.7,        // You can adjust temperature based on randomness
            max_tokens: isDependencyGraph? 10000: 1000,        // Limit token length of the response (adjust as needed)
            n: 1,                    // Number of completions to generate
            stream: false,           // Whether to stream back partial progress
            presence_penalty: 0,     // Encourages/discourages new ideas
            frequency_penalty: 0,    // Reduces repetition
        };
    }

    // Format request for Ollama-based models
    createOllamaRequest(prompt, isDependencyGraph) {
        const model = dih.getConfigJsonValue('model');

        if (!model) {
            throw new Error('Model not specified in oi-config.json');
        }


        // Skip the infilling prompt for dependency graph.
        if (!isDependencyGraph) {
            // Get the infilling prompt from parse.context.js
            // Prepare the prompt with <PRE> <SUF> <MID> structure for code infilling
            // const prompt = `<PRE>${prefix}<SUF>${suffix}<MID>${mid}`;
        }

        return {
            model: model,  // Use the model from oi-config
            prompt: prompt,  // Pass the infilling prompt with tags
            stream: false,  // Disable streaming
            keep_alive: 1000,
            format: "json",
            options: {
                temperature: 0.5,  // Adjust randomness as needed
                presence_penalty: 0,
                frequency_penalty: 0,
            }
        };
    }

    // Format request for Anthropic models
    createAnthropicRequest(prompt, { max_tokens_to_sample = 150, temperature = 0.7 }) {
        return {
            prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,  // Anthropics model style
            max_tokens_to_sample: max_tokens_to_sample,
            temperature: temperature,
        };
    }
}

module.exports = new FormatRequest(); 