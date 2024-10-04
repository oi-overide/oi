class ParserHelper {
    static regPrompt = /\/\/>\s*(.*?)\s*<\//;
    static regGenerated = /\/\/-\s*([\s\S]*?)\s*-\/\//g;
    static regAcceptance = /\/\/>\s*Accept the changes \(y\/n\):\s*([ynYN])\s*-\/\//;

    matchRegex(regex, text) {
        return text.match(regex);
    }

    matchUserPrompt(text) {
        return this.matchRegex(ParserHelper.regUserPrompt, text);
    }

    matchConfirmationPrompt(text) {
        return this.matchRegex(ParserHelper.regConfirmationWithResponse, text);
    }

    matchGeneratedPrompt(text) {
        return this.matchRegex(ParserHelper.regGeneratedBlock, text);
    }

    identifyPromptCase(text) {
        const userPrompt = this.matchUserPrompt(text);
        const confirmationPrompt = this.matchConfirmationPrompt(text);
        const generatedPrompt = this.matchGeneratedPrompt(text);

        if (userPrompt) {
            return 'prompt';
        } else if (confirmationPrompt) {
            return 'generated';
        } else if (generatedPrompt) {
            return 'acceptance';
        } else {
            return null;
        }
    }
}

module.exports = new ParserHelper();