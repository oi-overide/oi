class ParserHelper {
    static regPrompt = /\/\/>\s*((?:(?!-\/\/)[\s\S])*?)\s*<\/\//s;
    static regGenerated = /\/\/-\s*([\s\S]*?)\s*-\/\//s;
    static regAcceptance = /\/\/>\s*Accept the changes \(y\/n\):\s*([ynYN])\s*-\/\//;

    static regComment = /\/\/@\s*comment\s*$/g;  // Matches //@comment with no extra text after it
    static regContext = /\/\/@\s*context\s*$/g;  // Matches //@context with no extra text after it
    static regComplete = /\/\/@\s*complete\s*$/g; // Matches //@complete with no extra text after it

    getLineIndexOfMatch(prompt, text){
        const lines = text.split('\n');
        let lineIndex = 0;
        for(let i = 0; i < lines.length; i++){
            if(lines[i].includes(prompt)){
                lineIndex = i;
                break;
            }
        }

        return lineIndex;
    }

    matchRegex(regex, text) {
        return text.match(regex);
    }
    
    // Identify the case type based on the matched prompt and return a tuple with the type and content
    identifyPromptCase(text) {
        const promptBuffer = [];

        const userPrompt = this.matchRegex(ParserHelper.regPrompt, text);
        if (userPrompt) {
            const lineIndex = this.getLineIndexOfMatch(userPrompt[1], text);
            promptBuffer.push( ['prompt', userPrompt[0], lineIndex]); // Return type 'prompt' and the captured content 
        }

        const acceptancePrompt = this.matchRegex(ParserHelper.regAcceptance, text);
        if (acceptancePrompt) {
            const lineIndex = this.getLineIndexOfMatch(acceptancePrompt[1], text);

            // Acceptance Line
            const acceptanceLine = acceptancePrompt[0];

            // Match the codeBlock
            const codeBlockMatch = this.matchRegex(ParserHelper.regGenerated, text);

            // Get the response
            const response = acceptancePrompt[1];

            if (codeBlockMatch) {
                const codeBlock = codeBlockMatch[0];
                promptBuffer.push(['acceptance',response, acceptanceLine, codeBlock, lineIndex]); // Return type 'acceptance' and the captured response (y/n)
            }
        } 

        const comment = this.matchRegex(ParserHelper.regComment, text);
        if (comment) {
            const lineIndex = this.getLineIndexOfMatch(comment[1], text);
            promptBuffer.push(['comment', comment[1], lineIndex]); // Return type 'comment' and the captured content
        }

        const context = this.matchRegex(ParserHelper.regContext, text);
        if (context) {
            const lineIndex = this.getLineIndexOfMatch(context[1], text);
            promptBuffer.push(['context', context[1], lineIndex]); // Return type 'context' and the captured content
        }

        const complete = this.matchRegex(ParserHelper.regComplete, text);
        if (complete) {
            const lineIndex = this.getLineIndexOfMatch(complete[1], text);
            promptBuffer.push(['complete', complete[1], lineIndex]); // Return type 'complete' and the captured content
        }

        return promptBuffer;
    }
}

module.exports = new ParserHelper();