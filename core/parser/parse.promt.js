const fs = require('fs');
const psh = require('../../helpers/help.parser');
const Context = require('./parse.context');
const FormatRequest = require('../formatter/format.request');
const Network = require('../network/network');
const FormatResponse = require('../formatter/format.response');
const Directory = require('../storage/directory/directory');

class Parser {

    // Handle the acceptance response
    async handleAcceptance(acceptanceLine, codeBlock, response, fileContent, filePath) {
        console.log(response);
        if(response === 'n'){            
            Directory.removeCodeBlock(fileContent, filePath, codeBlock);
            return;
        }

        if(response === 'y'){
            Directory.removeAcceptanceMessage(fileContent, filePath, acceptanceLine);
            return;
        }
    }


    // This is to handle the prompts.
    async handlePrompt(index, fileContent, prompt, filePath) {
        try {
            // Creating the request prompt.
            const promptArray = await Context.createPromptContext(index, fileContent, prompt);
            // Getting the request object.
            const requestObject = FormatRequest.createOpenAIRequest(prompt, promptArray);

            // Making the request.
            const response = await Network.doRequest(requestObject);

            // Parse the response
            const codeData = FormatResponse.formatOpenAIResponse(response);

            // Insert the code into the file.
            Directory.insertCodeBlock(filePath, prompt, codeData);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async parseFile(filePath, verbose) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const promptCase = psh.identifyPromptCase(fileContent);

            for (const casse of promptCase) {
                switch (casse[0]) {
                    case 'prompt':
                        if (verbose) {
                            console.log(`Prompt content: ${casse[1]}`);
                        }
                        this.handlePrompt(casse[2], fileContent, casse[1], filePath);
                        break;
                    case 'acceptance':
                        if (verbose) {
                            console.log(`Acceptance response: ${casse[1]}`);
                        }
                        this.handleAcceptance(casse[2],casse[3], casse[1], fileContent, filePath);
                        break;
                    case 'comment':
                        if (verbose) {
                            console.log(`Comment content: ${casse[1]}`);
                        }
                        break;
                    case 'context':
                        if (verbose) {
                            console.log(`Context content: ${casse[1]}`);
                        }
                        break;
                    case 'complete':
                        if (verbose) {
                            console.log(`Complete content: ${casse[1]}`);
                        }
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

module.exports = new Parser();
