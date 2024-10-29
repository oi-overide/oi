import { PromptInfo } from "../../types/type.promptInfo";

/**
 * The `PromptHelper` class provides utility methods for identifying and processing
 * various types of prompts within a text input, including user prompts, acceptance
 * prompts, comments, context, and completion indicators.
 */
class PromptHelper {
    // Regular expressions to match specific prompt types
    static regPrompt: RegExp = /\/\/>\s*((?:(?!-\/\/)[\s\S])*?)\s*<\/\//s;           // Matches user prompts
    static regGenerated: RegExp = /\/\/-\s*([\s\S]*?)\s*-\/\//s;                    // Matches generated code blocks
    static regAcceptance: RegExp = /\/\/>\s*Accept the changes \(y\/n\):\s*([ynYN])\s*-\/\//; // Matches acceptance prompts

    // Regular expressions for specific annotations
    static regComment: RegExp = /\/\/@\s*comment\s*$/g;  // Matches //@comment with no extra text after it
    static regContext: RegExp = /\/\/@\s*context\s*$/g;  // Matches //@context with no extra text after it
    static regComplete: RegExp = /\/\/@\s*complete\s*$/g; // Matches //@complete with no extra text after it

    /**
     * Finds the line index of a matched prompt in the provided text.
     * 
     * @param prompt - The prompt to search for.
     * @param text - The text in which to search for the prompt.
     * @returns The index of the line where the prompt was found.
     */
    getLineIndexOfMatch(prompt: string, text: string): number {
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
     * @param regex - The regular expression to use for matching.
     * @param text - The text to match against.
     * @returns The result of the match, or null if no match was found.
     */
    matchRegex(regex: RegExp, text: string): RegExpMatchArray | null {
        return text.match(regex);
    }

    /**
     * Identifies different types of prompts within the provided text and returns
     * an array of `PromptInfo` objects containing the type and relevant content.
     * 
     * @param text - The text to analyze for prompts.
     * @returns An array of `PromptInfo` objects with prompt types and their corresponding content.
     */
    identifyPromptCase(text: string): PromptInfo[] {
        const promptBuffer: PromptInfo[] = [];

        // Check for user prompts
        const userPrompt = this.matchRegex(PromptHelper.regPrompt, text);
        if (userPrompt) {
            const lineIndex = this.getLineIndexOfMatch(userPrompt[0], text);
            promptBuffer.push({ type: 'prompt', content: userPrompt[1], lineIndex, codeBlock: ""}); // Add prompt type and content
        }

        // Check for acceptance prompts
        const acceptancePrompt = this.matchRegex(PromptHelper.regAcceptance, text);
        if (acceptancePrompt) {
            const lineIndex = this.getLineIndexOfMatch(acceptancePrompt[0], text);
            const acceptanceLine = acceptancePrompt[0];
            const codeBlockMatch = this.matchRegex(PromptHelper.regGenerated, text);
            const response = acceptancePrompt[1];

            if (codeBlockMatch) {
                const codeBlock = codeBlockMatch[0];
                promptBuffer.push({ type: 'acceptance', content: response, lineIndex, codeBlock }); // Add acceptance type and content
            }
        }

        return promptBuffer; // Return all identified prompts
    }
}

export default new PromptHelper();
