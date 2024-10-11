class FormatResponse {
    /**
     * Format the response for OpenAI models
     * @param {string} response - The response from the OpenAI API
     * @returns {string} - The code that needs to be inserted.
     */
    formatOpenAIResponse(response) {
        try {
            // Extract the content from the first choice
            const content = response.choices[0].message.content;

            // Use a regular expression to capture the code block inside ```
            const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);

            if (codeMatch && codeMatch[1]) {
                return codeMatch[1];  // Return the extracted code
            } else {
                throw new Error("No code block found in the response");
            }
        } catch (error) {
            console.error("Error formatting OpenAI response:", error.message);
            return null;
        }
    }
}

module.exports = new FormatResponse();