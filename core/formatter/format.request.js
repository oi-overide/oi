class FormatRequest {
    modelType;

    setModelType(modelType) {
        this.modelType = modelType;
        return this;
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
    createOpenAIRequest(prompt, { temperature = 0.7, max_tokens = 150, model = "gpt-3.5-turbo" }) {
        return {
            model: model,
            prompt: prompt,
            max_tokens: max_tokens,
            temperature: temperature,
            n: 1,
            stop: null,
        };
    }

    // Format request for Ollama-based models
    createOllamaRequest(prompt, { model = "default-ollama-model", temperature = 0.7 }) {
        return {
            model: model,
            prompt: prompt,
            temperature: temperature,
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

exports.FormatRequest = new FormatRequest();