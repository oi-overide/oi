class FormatRequest {
    // Format request for OpenAI models
    createOpenAIRequest(prompt, promptArray, verbose) {

        const context = `
            <First 10 lines of the file>
            ${promptArray[0]}

            <10 lines before the insertion>
            ${promptArray[1]}

            <10 lines after the insertion>
            ${promptArray[3]}
        `;

        // Construct a clearer and more informative prompt
        let finalPrompt = `You are a coding assistant specialized in generating accurate and efficient code completions. 
            Below is the current code context and an incomplete code block that needs to be completed.

            Context:
            ${context}

            Incomplete code:
            ${prompt}

            Please generate the missing code to ensure the functionality is correct, 
            efficient, and follows best practices. If necessary, include comments explaining the code.`;


        if (verbose) {
            console.log(`Prompt Text : ${finalPrompt}`);
        }

        // Construct the request body for OpenAI API
        return {
            model: "gpt-4o",
            messages: [
                { role: 'system', content: 'You are a coding assistant api.' },
                { role: 'user', content: finalPrompt },
            ],
            temperature: 0.7,        // You can adjust temperature based on randomness
            max_tokens: 1000,        // Limit token length of the response (adjust as needed)
            n: 1,                    // Number of completions to generate
            stream: false,           // Whether to stream back partial progress
            presence_penalty: 0,     // Encourages/discourages new ideas
            frequency_penalty: 0,    // Reduces repetition
        };
    }

    // Format request for Ollama-based models
    createOllamaRequest(prompt, isDependencyGraph) {
        if (!model) {
            throw new Error('Model not specified in oi-config.json');
        }

        let finalPrompt = prompt;

        // Skip the infilling prompt for dependency graph.
        if (!isDependencyGraph) {
            finalPrompt = `<|fim▁begin|>${prompt[0]}\n<|fim▁hole|>${prompt[1]}<|fim▁end|>}\n. Just respond with the code block.`;
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

    createDeepSeekRequest(prompt, promptArray) {
        try {
            const context = `
            <First 10 lines of the file>
            ${promptArray[0]}

            <10 lines before the insertion>
            ${promptArray[1]}

            <10 lines after the insertion>
            ${promptArray[3]}
        `;

            // Construct a clearer and more informative prompt
            let finalPrompt = `You are a coding assistant specialized in generating accurate and efficient code completions. 
            Below is the current code context and an incomplete code block that needs to be completed.

            Context:
            ${context}

            Incomplete code:
            ${prompt}

            Please generate the missing code to ensure the functionality is correct, 
            efficient, and follows best practices. If necessary, include comments explaining the code.`;

            const messages = [{ "role": "system", "content": finalPrompt },
                              { "role": "user", "content": prompt }];

            return {
                messages: messages,
                model: "deepseek-chat",
            };

        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new FormatRequest(); 