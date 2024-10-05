class ParserHelper {
    static regPrompt = /\/\/>\s*(.*?)\s*<\//;
    static regGenerated = /\/\/-\s*([\s\S]*?)\s*-\/\//g;
    static regAcceptance = /\/\/>\s*Accept the changes \(y\/n\):\s*([ynYN])\s*-\/\//;

    static regComment = /\/\/@\s*comment\s*$/g;  // Matches //@comment with no extra text after it
    static regContext = /\/\/@\s*context\s*$/g;  // Matches //@context with no extra text after it
    static regComplete = /\/\/@\s*complete\s*$/g; // Matches //@complete with no extra text after it

    matchRegex(regex, text) {
        return text.match(regex);
    }

    // Identify the case type based on the matched prompt and return a tuple with the type and content
    identifyPromptCase(text) {
        const userPrompt = this.matchRegex(ParserHelper.regPrompt, text);
        if (userPrompt) {
            return ['prompt', userPrompt[1]]; // Return type 'prompt' and the captured content
        }

        const generatedBlock = this.matchRegex(ParserHelper.regGenerated, text);
        if (generatedBlock) {
            return ['generated', generatedBlock[1]]; // Return type 'generated' and the captured content
        }

        const acceptancePrompt = this.matchRegex(ParserHelper.regAcceptance, text);
        if (acceptancePrompt) {
            return ['acceptance', acceptancePrompt[1]]; // Return type 'acceptance' and the captured response (y/n)
        }

        const comment = this.matchRegex(ParserHelper.regComment, text);
        if (comment) {
            return ['comment', comment[1]]; // Return type 'comment' and the captured content
        }

        const context = this.matchRegex(ParserHelper.regContext, text);
        if (context) {
            return ['context', context[1]]; // Return type 'context' and the captured content
        }

        const complete = this.matchRegex(ParserHelper.regComplete, text);
        if (complete) {
            return ['complete', complete[1]]; // Return type 'complete' and the captured content
        }

        return [null, null]; // No match found, return nulls
    }
}

module.exports = new ParserHelper();