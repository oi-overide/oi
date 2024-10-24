const fs = require('fs');

const PromptHelper = require('../helpers/help.prompt');
const CodeInterface = require('../interface/interface.code');
const FindContext = require('./find.context');

const FormatRequest = require('../formatter/format.request');
const FormatResponse = require('../formatter/format.response');
const Network = require('../network/network');

/**
 * The `FindPrompt` class is responsible for identifying prompts or acceptance cases
 * in a file, generating the necessary code or performing the required actions based
 * on the identified prompt, and managing the code insertion or rejection process.
 *
 * Responsibilities:
 * - Search for prompt cases or acceptance responses in file content.
 * - Generate and format code based on identified prompts.
 * - Insert generated code into the appropriate location within the file.
 * - Handle user acceptance or rejection of code suggestions.
 */
class FindPrompt {
    /**
    * Determines the completion type for the found prompt.
    * If no code exists in the file and only a prompt is found, it returns 'complete'.
    * If code exists and the user wants to update it, it returns 'update'.
    *
    * @param {string} fileContent - The content of the file being processed.
    * @param {string} prompt - The prompt text found in the file.
    * @returns {string} The completion type: 'complete' or 'update'.
    */
    findCompletionType(fileContent, prompt) {
        // Basic logic to check if the file contains code besides the prompt
        const hasCode = fileContent.split('\n').some(line => line.trim() && line !== prompt.trim());

        // Return 'complete' if no code exists, else 'update'
        return hasCode ? 'update' : 'complete';
    }


    /**
     * Handles the acceptance case found in a file.
     * Removes either the entire code block if rejected, or the acceptance message if accepted.
     *
     * @param {string} acceptanceLine - The line containing the acceptance response.
     * @param {string} codeBlock - The block of code associated with the acceptance.
     * @param {string} response - The user's response, either 'y' (accept) or 'n' (reject).
     * @param {string} fileContent - The content of the file.
     * @param {string} filePath - The path to the file being processed.
     */
    async handleFoundAcceptance(acceptanceLine, codeBlock, response, fileContent, filePath) {
        // Remove the code block if the user rejects it
        if (response === 'n') {
            CodeInterface.removeCodeBlock(filePath, fileContent, codeBlock);
            return;
        }

        // Remove the acceptance message if the user accepts the suggestion
        if (response === 'y') {
            CodeInterface.removeAcceptanceMessage(filePath, fileContent, acceptanceLine);
            return;
        }
    }

    /**
     * Handles the prompt found in a file.
     * Gathers context, formats a request, makes a network request, and inserts the generated code.
     *
     * @param {number} index - The index (line number) of the prompt within the file.
     * @param {string} fileContent - The content of the file being processed.
     * @param {string} prompt - The prompt text found in the file.
     * @param {string} filePath - The path to the file.
     * @param {boolean} verbose - A flag indicating whether to log detailed information during the process.
     */
    async handleFoundPrompt(index, fileContent, prompt, filePath, verbose) {
        try {
            // Determine completion type: 'complete' or 'update'
            const completionType = this.findCompletionType(fileContent, prompt);

            // Create a prompt context by extracting surrounding content
            const promptArray = await FindContext.findPromptContext(index, fileContent, prompt);

            // Create a request object with the gathered context
            const requestObject = await FormatRequest.createRequest(prompt, promptArray, completionType, verbose);


            // Send the request and retrieve a response from the network
            const response = await Network.doRequest(requestObject);

            // Parse the network response to get the code
            const codeData = await FormatResponse.formatResponse(response, completionType);

            // // Insert the generated code block into the file at the appropriate location
            if (completionType === "complete") {
                CodeInterface.insertCodeBlock(filePath, prompt, codeData);
                return;
            }

            // console.log(codeData);
            CodeInterface.applyCodeReplacement(filePath, codeData);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    /**
     * Searches a file for prompt cases or acceptance responses and processes them accordingly.
     *
     * @param {string} filePath - The path to the file to be searched.
     * @param {boolean} verbose - A flag indicating whether to log detailed information during the search.
     */
    async findPromptInFile(filePath, verbose) {
        try {
            // Read the file content
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            // Identify any prompts or acceptance cases in the file
            const promptCase = PromptHelper.identifyPromptCase(fileContent);

            // Process each identified case
            for (const casse of promptCase) {
                switch (casse[0]) {
                    case 'prompt':
                        if (verbose) {
                            console.log(`Prompt content: ${casse[1]}`);
                        }
                        // Handle the found prompt
                        this.handleFoundPrompt(casse[2], fileContent, casse[1], filePath, verbose);
                        break;
                    case 'acceptance':
                        if (verbose) {
                            console.log(`Acceptance response: ${casse[1]}`);
                        }
                        // Handle the acceptance response
                        this.handleFoundAcceptance(casse[2], casse[3], casse[1], fileContent, filePath);
                        break;
                    default:
                        break;
                }
            }
        } catch (err) {
            console.error(`Error processing file ${filePath}:`, err.message);
        }
    }
}

module.exports = new FindPrompt();
