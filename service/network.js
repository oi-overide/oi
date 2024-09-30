const { Configuration, OpenAIApi, default: OpenAI } = require('openai');

// Load environment variables (make sure to set OPENAI_API_KEY in .env file)
require('dotenv').config();

// Initialize OpenAI API with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Make sure this is in your .env
    organisation: process.env.OPENAI_ORG_ID,
    project: "proj_KXJHh8FNqFn7EiKyvFjCJ32o" 
});

/**
 * Generate code using OpenAI Codex.
 * @param {string} prompt - The user prompt to generate code for.
 * @param {string} model - Optional. The model to use for code generation, defaults to 'gpt-3.5-turbo'.
 * @returns {string} - The generated code response.
 */
const generateCode = async (prompt, model = 'gpt-3.5-turbo') => {
    try {
        const response = await openai.chat.completions.create({
            model: model,  // You can use 'gpt-3.5-turbo' or 'gpt-4'
            messages: [{ role: "user", content: prompt }],  // Wrap the prompt in messages array
            max_tokens: 1000,  // Set a limit based on how much code you want
            temperature: 0.5,  // Adjust to control randomness
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        // const response = {
        //     choices: [
        //       {
        //         message: {
        //           role: "assistant",
        //           content: "```javascript\nfunction reverseString(str) {\n  return str.split('').reverse().join('');\n}\n```"
        //         }
        //       }
        //     ]
        //   };

        return response;
    } catch (error) {
        console.error(`Error generating code: ${error.message}`);
        throw error;
    }
};

module.exports = {generateCode};