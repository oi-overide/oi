/**
 * The `PromptHelper` class provides utility methods for identifying and processing
 * various types of prompts within a text input, including user prompts, acceptance
 * prompts, comments, context, and completion indicators.
 */
class PromptHelper {
    // Regular expressions to match specific prompt types
    static regPrompt = /\/\/>\s*((?:(?!-\/\/)[\s\S])*?)\s*<\/\//s;           // Matches user prompts
    static regGenerated = /\/\/-\s*([\s\S]*?)\s*-\/\//s;                    // Matches generated code blocks
    static regAcceptance = /\/\/>\s*Accept the changes \(y\/n\):\s*([ynYN])\s*-\/\//; // Matches acceptance prompts

    // Regular expressions for specific annotations
    static regComment = /\/\/@\s*comment\s*$/g;  // Matches //@comment with no extra text after it
    static regContext = /\/\/@\s*context\s*$/g;  // Matches //@context with no extra text after it
    static regComplete = /\/\/@\s*complete\s*$/g; // Matches //@complete with no extra text after it

    /**
     * Finds the line index of a matched prompt in the provided text.
     * 
     * @param {string} prompt - The prompt to search for.
     * @param {string} text - The text in which to search for the prompt.
     * @returns {number} - The index of the line where the prompt was found.
     */
    getLineIndexOfMatch(prompt, text) {
        const lines = text.split('\n');
        let lineIndex = -1; // Default to -1 if not found
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(prompt)) {
                lineIndex = i; // Update line index when prompt is found
                break;
            }
        }
        return lineIndex;
    }

    /**
     * Matches the provided text against a specified regular expression.
     * 
     * @param {RegExp} regex - The regular expression to use for matching.
     * @param {string} text - The text to match against.
     * @returns {Array|null} - The result of the match, or null if no match was found.
     */
    matchRegex(regex, text) {
        return text.match(regex);
    }
    
    /**
     * Identifies different types of prompts within the provided text and returns
     * an array of tuples containing the type and relevant content.
     * 
     * @param {string} text - The text to analyze for prompts.
     * @returns {Array} - An array of tuples with prompt types and their corresponding content.
     */
    identifyPromptCase(text) {
        const promptBuffer = [];

        // Check for user prompts
        const userPrompt = this.matchRegex(PromptHelper.regPrompt, text);
        if (userPrompt) {
            const lineIndex = this.getLineIndexOfMatch(userPrompt[1], text);
            promptBuffer.push(['prompt', userPrompt[0], lineIndex]); // Add prompt type and content
        }

        // Check for acceptance prompts
        const acceptancePrompt = this.matchRegex(PromptHelper.regAcceptance, text);
        if (acceptancePrompt) {
            const lineIndex = this.getLineIndexOfMatch(acceptancePrompt[1], text);
            const acceptanceLine = acceptancePrompt[0];
            const codeBlockMatch = this.matchRegex(PromptHelper.regGenerated, text);
            const response = acceptancePrompt[1];

            if (codeBlockMatch) {
                const codeBlock = codeBlockMatch[0];
                promptBuffer.push(['acceptance', response, acceptanceLine, codeBlock, lineIndex]); // Add acceptance type and content
            }
        } 

        // Check for comment prompts
        const comment = this.matchRegex(PromptHelper.regComment, text);
        if (comment) {
            const lineIndex = this.getLineIndexOfMatch(comment[1], text);
            promptBuffer.push(['comment', comment[1], lineIndex]); // Add comment type and content
        }

        // Check for context prompts
        const context = this.matchRegex(PromptHelper.regContext, text);
        if (context) {
            const lineIndex = this.getLineIndexOfMatch(context[1], text);
            promptBuffer.push(['context', context[1], lineIndex]); // Add context type and content
        }

        // Check for completion prompts
        const complete = this.matchRegex(PromptHelper.regComplete, text);
        if (complete) {
            const lineIndex = this.getLineIndexOfMatch(complete[1], text);
            promptBuffer.push(['complete', complete[1], lineIndex]); // Add completion type and content
        }

        return promptBuffer; // Return all identified prompts
    }
}

module.exports = new PromptHelper();
