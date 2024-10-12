const dih = require('../../helpers/help.directory');
const Directory = require('../storage/directory/directory');
const Network = require('../network/network');
const FormatRequest = require('../formatter/format.request');
const FormatResponse = require('../formatter/format.response');

class Context {

    // Context will store all the files in the project.
    fileContents = {};

    async createContext(verbose) {
        try {
            // Get Ignore Files
            const ignoredFiles = await dih.getConfigJsonValue("ignore");
            await Directory.gatherFilesRecursively(process.cwd(), this.fileContents, ignoredFiles, verbose);

            const prompt = `
                {{ .System }}
                ### Instruction: Remember the following code from a project. Respond with success or failure. 

                ${JSON.stringify(this.fileContents)}
            `;

            if(verbose){
                console.log(`Sending Project Context \n${prompt}\n`)
            }

            // Get the formated request
            const request = FormatRequest.model().formatRequest(prompt, true);

            if(verbose){
                console.log(`Request Structure \n${request}\n`)
            }

            // Get the URL for the selected model.
            const url = FormatRequest.model().getUrl();

            // Make the network call.
            const response = await Network.doRequest(request, url, verbose);

            // Format the response.
            if(verbose){
                await FormatResponse.model().formatResponse(response, verbose);
            }
        } catch (error) {
            console.error("Error creating context:", error);
        }
    }

    async createPromptContext(index, fileContent, prompt, verbose) {
        try {
            
            if(verbose){
                console.log('Creating Prompt Context');
            }

            const lines = fileContent.split('\n');
            const importsBuffer = [];
            const preContextBuffer = [];
            const postContextBuffer = [];

            for(let [curIndex, line] of lines.entries()){

                if(index < 10){
                    importsBuffer.push(line.trim());
                }

                // Keeping the window size of 10 lines before the prompt.
                if(curIndex >= (index-10) && curIndex < index){
                    preContextBuffer.push(line.trim());
                }

                if(curIndex > index && curIndex <= (index+10)){
                    postContextBuffer.push(line.trim());
                }
            }

            const trimmedPrompt = prompt.replace('//>', '').replace('<//', '').replace('\n', '').replace('//','').trim();

            return [importsBuffer.join('\n'),preContextBuffer.join('\n'), trimmedPrompt, postContextBuffer.join('\n')];
        } catch (e) {
            console.error("Error creating prompt context:", e);
            throw e;
        }   
    }
}

module.exports = new Context();
