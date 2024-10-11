const fs = require('fs');
const psh = require('../../helpers/help.parser');
const context = require('./parse.context');
const FormatRequest = require('../formatter/format.request');
const Network = require('../network/network');

class Parser {
    // Handle prompt case.
    async handlePrompt(index, fileContent, prompt) {
        try {
            const promptArray = await context.createPromptContext(index, fileContent, prompt);
            const requestObject = FormatRequest.model().formatRequest(promptArray, false);
            const url = FormatRequest.model().getUrl();
            const response = await Network.doRequest(requestObject, url);
            return response;
        } catch (e){
           console.log(e);
           throw e;
        } 
    }

    // Helper function to identify and parse prompt cases
    handleParseCase(index, fileContent, prompt, verbose) {
        const [caseType, content] = psh.identifyPromptCase(prompt); // Get case type and content as a tuple

        switch (caseType) {
            case 'prompt':
                if(verbose){
                    console.log(`Prompt content: ${content}`);
                }
                this.handlePrompt(index, fileContent, prompt);
                break;
            case 'acceptance':
                if (verbose) {
                    console.log(`Acceptance response: ${content}`);
                }
                break;
            case 'comment':
                if (verbose) {
                    console.log(`Comment content: ${content}`);
                }
                break;
            case 'context':
                if (verbose) {
                    console.log(`Context content: ${content}`);
                }
                break;
            case 'complete':
                if (verbose) {
                    console.log(`Complete content: ${content}`);
                }
                break;
            default:
                break;
        }
    }

    async parseFile(filePath, verbose) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');

            let promptBuffer = [];
            let isMultiline = false;

            for (let [index, line] of lines.entries()) {
                const trimmedLine = line.trim();

                // Start of a multiline prompt or generated block
                if ((trimmedLine.includes('//>') || trimmedLine.includes('//-')) && !isMultiline) {
                    isMultiline = true;
                }

                // Accumulate lines if inside a multiline block
                if (isMultiline) {
                    promptBuffer.push(trimmedLine);

                    // Check for the closing tag to end the multiline block
                    if (trimmedLine.includes('<//') || trimmedLine.includes('-//')) {
                        isMultiline = false;

                        // Join all lines in the buffer into a single string for parsing
                        const fullBlock = promptBuffer.join(' ');
                        this.handleParseCase(index, fileContent, fullBlock, verbose); // Use the helper function for multiline blocks

                        // Reset the buffer
                        promptBuffer = [];
                    }
                    continue; // Skip further processing in the multiline case
                }

                // Process single-line prompts, generated blocks, comments, context, and complete markers
                this.handleParseCase(index, fileContent, trimmedLine, verbose);
            }
        } catch (err) {
            console.error(`Error processing file ${filePath}:`, err.message);
        }
    }
}

module.exports = new Parser();
