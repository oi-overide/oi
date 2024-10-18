const DirectoryHelper = require('../../helpers/help.directory');

class FormatRequest {
    // Create a dynamic request based on the active service
    async createRequest(prompt, promptArray, verbose = false) {
        try {
            // Get active service details (returns details like platform, apiKey, etc.)
            const activeServiceDetails = await DirectoryHelper.getActiveServiceDetails();

            // Check which platform is active and call the respective request function
            switch (activeServiceDetails.platform) {
                case 'openai':
                    return this.createOpenAIRequest(prompt, promptArray, activeServiceDetails, verbose);

                case 'deepseek':
                    return this.createDeepSeekRequest(prompt, promptArray, activeServiceDetails);

                default:
                    throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
            }
        } catch (error) {
            console.error(`Error in creating request: ${error.message}`);
        }
    }

    // Format request for OpenAI models
    async createOpenAIRequest(prompt, promptArray,activeServiceDetails, verbose) {
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
            activeServiceDetails,
            "metadata": {
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
            },
        };
    }

    async createDeepSeekRequest(prompt, promptArray, activeServiceDetails) {
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

            Please generate the complete code or missing code to ensure the functionality is correct, 
            efficient, and follows best practices. Don't explain the code in any way. Put the code inside markdown quote.`;

            const messages = [{ "role": "system", "content": finalPrompt },
            { "role": "user", "content": prompt }];

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