const fs = require('fs');
const psh = require('../../helpers/help.parser');
const context = require('./parse.context');
const freq = require('../formatter/format.request');

class Parser {

    // Handle prompt case.
    async handlePrompt(content, filePath) {
       const processedPrompt = await context.createContext(content, filePath);
       const requestObject = freq.formatRequest(processedPrompt);
       console.log(requestObject);
       console.log(processedPrompt);
    }

    // Helper function to identify and parse prompt cases
    handleParseCase(text, filePath) {
        const [caseType, content] = psh.identifyPromptCase(text); // Get case type and content as a tuple

        switch (caseType) {
            case 'prompt':
                this.handlePrompt(content, filePath);
                break;
            case 'acceptance':
                console.log(`Acceptance response: ${content}`);
                break;
            case 'comment':
                console.log(`Comment content: ${content}`);
                break;
            case 'context':
                console.log(`Context content: ${content}`);
                break;
            case 'complete':
                console.log(`Complete content: ${content}`);
                break;
            default:
                console.log('No valid case found.');
                break;
        }
    }

    async parseFile(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');

            let promptBuffer = [];
            let isMultiline = false;

            for (let line of lines) {
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
                        this.handleParseCase(fullBlock, filePath); // Use the helper function for multiline blocks

                        // Reset the buffer
                        promptBuffer = [];
                    }
                    continue; // Skip further processing in the multiline case
                }

                // Process single-line prompts, generated blocks, comments, context, and complete markers
                this.handleParseCase(trimmedLine, filePath);
            }
        } catch (err) {
            console.error(`Error processing file ${filePath}:`, err.message);
        }
    }
}

module.exports = new Parser();
