/**
 * Type representing the information of a prompt.
 */
export type PromptInfo = {
    type: 'prompt' | 'acceptance' | 'comment' | 'context' | 'complete'; // The type of prompt
    content: string;    // The content of the prompt
    lineIndex: number;  // The line index where the prompt was found
    codeBlock?: string; // Optional code block for acceptance prompts
};
