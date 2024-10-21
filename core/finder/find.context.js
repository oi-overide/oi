/**
 * The `FindContext` class is responsible for extracting contextual information
 * around a specified prompt within a file. It retrieves import statements, 
 * pre-context, post-context, and the trimmed version of the prompt from the file content.
 *
 * Responsibilities:
 * - Extract surrounding lines (context) around a given prompt within a file.
 * - Handle verbose mode for logging detailed information during context extraction.
 * - Return a structured context including imports, pre-prompt lines, the prompt itself, and post-prompt lines.
 */
class FindContext {
    /**
     * Finds the context surrounding a prompt in the file content.
     * 
     * @param {number} index - The index (line number) where the prompt appears in the file.
     * @param {string} fileContent - The entire content of the file as a string.
     * @param {string} prompt - The specific prompt text to find in the file.
     * @param {boolean} verbose - A flag indicating whether to log detailed messages.
     * @returns {Array} - An array containing the imports, pre-context, trimmed prompt, and post-context.
     */
    async findPromptContext(index, fileContent, prompt, verbose) {
        try {
            if (verbose) {
                console.log('Creating Prompt Context');
            }

            const lines = fileContent.split('\n'); // Split file content into lines
            const importsBuffer = []; // Buffer for storing import statements
            const preContextBuffer = []; // Buffer for storing lines before the prompt
            const postContextBuffer = []; // Buffer for storing lines after the prompt

            // Iterate through the lines of the file
            for (let [curIndex, line] of lines.entries()) {

                // Collect the first 10 lines as import statements
                if (index < 10) {
                    importsBuffer.push(line.trim());
                }

                // Collect the 10 lines preceding the prompt
                if (curIndex >= (index - 10) && curIndex < index) {
                    preContextBuffer.push(line.trim());
                }

                // Collect the 10 lines following the prompt
                if (curIndex > index && curIndex <= (index + 10)) {
                    postContextBuffer.push(line.trim());
                }
            }

            // Clean and trim the prompt text by removing delimiters and excess whitespace
            const trimmedPrompt = prompt.replace('//>', '').replace('<//', '').replace('\n', '').replace('//', '').trim();

            // Return the extracted context: imports, pre-context, trimmed prompt, post-context
            return [importsBuffer.join('\n'), preContextBuffer.join('\n'), trimmedPrompt, postContextBuffer.join('\n')];
        } catch (e) {
            // Log and throw any errors encountered during context extraction
            console.error("Error creating prompt context:", e);
            throw e;
        }
    }
}

// Export an instance of the FindContext class
module.exports = new FindContext();
