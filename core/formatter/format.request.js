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
    formatRequest(prompt, isDependencyGraph) {
        switch (this.modelType) {
            case 'openai':
                return this.createOpenAIRequest(prompt, isDependencyGraph);

            case 'ollama':
                return this.createOllamaRequest(prompt, isDependencyGraph);

            case 'anthropic':
                return this.createAnthropicRequest(prompt, isDependencyGraph);

            default:
                throw new Error(`Unknown model type: ${this.modelType}`);
        }
    }

    // Format request for OpenAI models
    createOpenAIRequest(prompt, isDependencyGraph) {
        // Get the model name from oi-config.json
        const model = dih.getConfigJsonValue('model');

        if (!model) {
            throw new Error('Model not specified in oi-config.json');
        }

        let finalPrompt = prompt;

        // Skip infilling prompt when generating the dependency graph
        if (!isDependencyGraph) {
            // For OpenAI, manually simulate infilling by crafting a structured prompt
            // Use this in case of //@complete
            finalPrompt = `Complete the code based on the following context:\n\n${prompt[0]}\n\nFill in the missing part here.\n\n${prompt[2]}`;
        }

        // Construct the request body for OpenAI API
        return {
            model: model,
            messages: [{ role: 'user', content: finalPrompt }],
            temperature: 0.7,        // You can adjust temperature based on randomness
            max_tokens: 10000,      // Limit token length of the response (adjust as needed)
            n: 1,                    // Number of completions to generate
            stream: false,           // Whether to stream back partial progress
            presence_penalty: 0,     // Encourages/discourages new ideas
            frequency_penalty: 0,    // Reduces repetition
        };
    }

    // Format request for Ollama-based models
    createOllamaRequest(prompt,isDependencyGraph) {
        const model = dih.getConfigJsonValue('model');

        if (!model) {
            throw new Error('Model not specified in oi-config.json');
        }

        let finalPrompt = prompt;

        // Skip the infilling prompt for dependency graph.
        if (!isDependencyGraph) {
            // Get the infilling prompt from parse.context.js
            // Prepare the prompt with <PRE> <SUF> <MID> structure for code infilling
            // finalPrompt = `<PRE>${prompt[0]}<SUF>${prompt[2]}<MID>${prompt[1]}\nRESPOND IN JSON.`;

            finalPrompt = `<｜fim▁begin｜>${prompt[0]}\n<｜fim▁hole｜>${prompt[1]}<｜fim▁end｜>}\n. Just respond with the code block.`;
        }

        return {
            model: model,  // Use the model from oi-config
            prompt: finalPrompt,  // Pass the infilling prompt with tags
            stream: false,  // Disable streaming
            keep_alive: 1000,
            options: {
                num_ctx: 8102,
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