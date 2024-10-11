const dih = require('../../helpers/help.directory')


class FormatRequest {
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
            finalPrompt = `Complete the code based on the following context:\n\n${prompt}\n\nFill in the missing part here.`;
        }

        // Construct the request body for OpenAI API
        return {
            model: model,
            messages: [{ role: 'user', content: finalPrompt }],
            temperature: 0.7,        // You can adjust temperature based on randomness
            max_tokens: 1000,        // Limit token length of the response (adjust as needed)
            n: 1,                    // Number of completions to generate
            stream: false,           // Whether to stream back partial progress
            presence_penalty: 0,     // Encourages/discourages new ideas
            frequency_penalty: 0,    // Reduces repetition
        };
    }
}

module.exports = new FormatRequest(); 