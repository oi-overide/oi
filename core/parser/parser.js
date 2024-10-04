const fs = require('fs');
const psh = require('../../helpers/help.parser');


class Parser {
    async parsePrompt(prompt){
        const pValue = psh.matchUserPrompt(prompt);
        console.log(pValue);
    }

    async parseGenerated(generated){
        const pValue = psh.matchGeneratedPrompt(generated);
        console.log(pValue);
    }

    async parseAcceptance(acceptance){    
        const pValue = psh.matchConfirmationPrompt(acceptance);
        console.log(pValue);
    }

    async parseFile(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');

            const promptLines = [];
            let multiline = false;

            for (let line of lines) {

                // Handling Multi Line Prompts
                if(line.trim().includes('//>') && !line.trim().includes('<//') && !multiline) {
                    multiline = true;
                }
                
                if(multiline) { 
                    promptLines.push(line.trim());
                    continue;
                }

                if(!line.trim().includes('//>') || line.trim().includes('<//') && multiline) {
                    multiline = false;
                    line = promptLines.join(' ');
                }
                
                // Handling Single Line Prompts
                const caseType = psh.identifyPromptCase(line); // Determine the type of case

                switch (caseType) {
                    case 'prompt':
                        this.parsePrompt(line);
                        break;

                    case 'generated':
                        this.parseGenerated(line);
                        break;

                    case 'acceptance':
                        this.parseAcceptance(line);
                        break;
                    default:
                        break;
                }
            }
        } catch (err) {
            console.error(`Error processing file ${filePath}:`, err);
        }
    }
}

module.exports = new Parser();