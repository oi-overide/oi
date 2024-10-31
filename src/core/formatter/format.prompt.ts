import { PromptInfo } from '../../interfaces/interfaces';

// Loading JSON structure into a variable
import promptStructure from '../../../assets/prompt.structure.json';

/**
 * The `FormatPrompt` class is responsible for constructing and formatting prompts
 * for different AI platforms (like OpenAI and DeepSeek). It uses a base prompt template
 * and dynamically fills in context based on the file content around the prompt.
 *
 * Responsibilities:
 * - Fetch the active platform's details (OpenAI, DeepSeek).
 * - Generate a formatted prompt based on the active platform.
 * - Load and process a base prompt template from configuration files.
 * - Dynamically construct context around the insertion point for prompt creation.
 */
class FormatPrompt {
  private basePrompt: PromptInfo;

  constructor() {
    this.basePrompt = promptStructure;
  }

  /**
   * Creates and formats a prompt for OpenAI models.
   *
   * @param {Array<string>} contextArray - The array of context around the prompt.
   * @param {string} prompt - The raw prompt text.
   * @param {string} completionType - The type of completion (e.g., 'complete' or 'update').
   * @returns {Promise<string>} The formatted OpenAI prompt.
   */
  async getOpenAiPrompt(
    contextArray: string[],
    prompt: string,
    completionType: string
  ): Promise<string> {
    try {
      const platform = 'openai';

      // In all the cases load the system prompt
      const systemPrompt = this.basePrompt[platform].systemMessage;
      const codeContext = this.getCodeContext(contextArray, prompt);
      const instructions = this.getInstructions(completionType, platform);

      let format = '';
      let contextPrompt = '';

      if (completionType === 'update') {
        contextPrompt = this.basePrompt[platform].update.context;
        format = this.basePrompt[platform].update.format;
      } else {
        format = this.basePrompt[platform].complete.format;
      }

      const finalPrompt = `${systemPrompt}${contextPrompt}${codeContext}\n${instructions}\n${format}`;
      return finalPrompt;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating OpenAI prompt: ${error.message}`);
      }
      throw error; // Re-throw the error for further handling
    }
  }

  /**
   * Creates and formats a prompt for DeepSeek models.
   *
   * @param {Array<string>} contextArray - The array of context around the prompt.
   * @param {string} prompt - The raw prompt text.
   * @param {string} completionType - The type of completion (e.g., 'complete' or 'update').
   * @returns {Promise<string>} The formatted DeepSeek prompt.
   */
  async getDeepSeekPrompt(
    contextArray: string[],
    prompt: string,
    completionType: string
  ): Promise<string> {
    try {
      const platform = 'deepseek';

      // In all the cases load the system prompt
      const systemPrompt = this.basePrompt[platform].systemMessage;
      const codeContext = this.getCodeContext(contextArray, prompt);
      const instructions = this.getInstructions(completionType, platform);

      let format = '';
      let contextPrompt = '';

      // If the completion type is 'update', load the context and update prompt
      if (completionType === 'update') {
        contextPrompt = this.basePrompt[platform].update.context;
        format = this.basePrompt[platform].update.format;
      } else {
        format = this.basePrompt[platform].complete.format;
      }

      const finalPrompt = `${systemPrompt}${contextPrompt}${codeContext}\n${instructions}\n${format}`;
      return finalPrompt;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating DeepSeek prompt: ${error.message}`);
      }
      throw error; // Re-throw the error for further handling
    }
  }

  /**
   * Creates and formats a prompt for Groq models.
   *
   * @param {Array<string>} contextArray - The array of context around the prompt.
   * @param {string} prompt - The raw prompt text.
   * @param {string} completionType - The type of completion (e.g., 'complete' or 'update').
   * @returns {Promise<string>} The formatted Groq prompt.
   */
  async getGroqPrompt(
    contextArray: string[],
    prompt: string,
    completionType: string
  ): Promise<string> {
    try {
      const platform = 'groq';

      const systemPrompt = this.basePrompt[platform].systemMessage;
      const codeContext = this.getCodeContext(contextArray, prompt);
      const instructions = this.getInstructions(completionType, platform);

      let format = '';
      let contextPrompt = '';

      if (completionType === 'update') {
        contextPrompt = this.basePrompt[platform].update.context;
        format = this.basePrompt[platform].update.format;
      } else {
        format = this.basePrompt[platform].complete.format;
      }

      const finalPrompt = `${systemPrompt}${contextPrompt}${codeContext}\n${instructions}\n${format}`;
      return finalPrompt;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating Groq prompt: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generates a formatted string containing the file content and user prompt.
   *
   * @param contextArray - An array of strings representing the context (e.g., lines of code)
   *                      relevant to the user prompt.
   * @param prompt - The user-provided prompt that needs to be included in the output.
   * @returns A formatted string that includes the first element of contextArray and the user prompt.
   */
  private getCodeContext(contextArray: string[], prompt: string): string {
    return `File Content :\n${contextArray[0]}\n user prompt :${prompt}\n`;
  }

  /**
   * Retrieves instructions based on the completion type and platform.
   *
   * @param completionType - A string indicating the type of completion requested
   *                         (e.g., "update" or "complete").
   * @param platform - A string representing the platform for which instructions are to be retrieved.
   * @returns A string containing the instructions relevant to the specified completion type and platform.
   */
  private getInstructions(completionType: string, platform: string): string {
    let instructionList = [];
    if (completionType === 'update') {
      instructionList = this.basePrompt[platform].update.instructions;
    } else {
      instructionList = this.basePrompt[platform].complete.instructions;
    }
    return instructionList.join('');
  }
}

export default new FormatPrompt();
