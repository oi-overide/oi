/**
 * Type representing the information of a prompt.
 */
export type UserPromptInfo = {
    type: 'prompt' | 'acceptance';// The type of prompt
    content: string;    // The content of the prompt
    lineIndex: number;  // The line index where the prompt was found
    codeBlock: string; // Optional code block for acceptance prompts
    acceptanceLine?: string; // Optional acceptance line for acceptance prompts
};

export type CompletionType = 'complete' | 'update';
