// Loading JSON structure into a variable
import promptStructure from '../../../assets/prompt.structure.json';
import { SystemPromptInfo } from '../../models/model.prompts';

abstract class SystemPromptService {
  abstract findContext(
    index: number,
    fileContent: string,
    prompt: string,
    verbose: boolean
  ): Promise<[string, string]>;

  abstract getOpenAiPrompt(
    contextArray: string[],
    prompt: string,
    completionType: string
  ): Promise<string>;

  abstract getDeepSeekPrompt(
    contextArray: string[],
    prompt: string,
    completionType: string
  ): Promise<string>;

  abstract getGroqPrompt(
    contextArray: string[],
    prompt: string,
    completionType: string
  ): Promise<string>;
}

class SystemPromptServiceImpl extends SystemPromptService {
  private basePrompt: SystemPromptInfo;

  constructor() {
    super();
    this.basePrompt = promptStructure;
  }

  /**
   * Finds the context surrounding a prompt in the file content.
   *
   * @param {number} index - The index (line number) where the prompt appears in the file.
   * @param {string} fileContent - The entire content of the file as a string.
   * @param {string} prompt - The specific prompt text to find in the file.
   * @param {boolean} verbose - A flag indicating whether to log detailed messages.
   * @returns {Promise<[string, string]>} - A promise that resolves to an array containing the file content and trimmed prompt.
   */
  async findContext(
    index: number,
    fileContent: string,
    prompt: string,
    verbose: boolean
  ): Promise<[string, string]> {
    try {
      if (index && verbose) {
        console.log('Creating Prompt Context');
      }

      // Clean and trim the prompt text by removing delimiters and excess whitespace
      const trimmedPrompt = prompt
        .replace('//>', '')
        .replace('<//', '')
        .replace('\n', '')
        .replace('//', '')
        .trim();

      // Return the extracted context: file content and trimmed prompt
      return [fileContent, trimmedPrompt];
    } catch (e) {
      if (verbose) {
        // Log and throw any errors encountered during context extraction
        console.error('Error creating prompt context:', e);
      }
      throw e;
    }
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

export default new SystemPromptServiceImpl();
