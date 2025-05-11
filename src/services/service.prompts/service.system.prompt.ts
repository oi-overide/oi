import fs from 'fs';

// Loading JSON structure into a variable
import { ChatCompletionMessageParam } from 'openai/resources';
import promptStructure from '../../../assets/prompt.structure.json';
import {
  InsertionRequestInfo,
  SystemPromptInfo,
  SystemPromptPlatformInfo
} from '../../models/model.prompts';

abstract class SystemPromptService {
  abstract getOpenAiSystemMessage(
    insertionRequest: InsertionRequestInfo
  ): Promise<ChatCompletionMessageParam[]>;
}

class SystemPromptServiceImpl extends SystemPromptService {
  private static instance: SystemPromptServiceImpl;
  private basePrompt: SystemPromptInfo;

  private constructor() {
    super();
    this.basePrompt = promptStructure;
  }

  public static getInstance(): SystemPromptServiceImpl {
    if (!SystemPromptServiceImpl.instance) {
      SystemPromptServiceImpl.instance = new SystemPromptServiceImpl();
    }
    return SystemPromptServiceImpl.instance;
  }

  /**
   * Creates and formats a prompt for OpenAI models.
   *
   * @param {Array<string>} contextArray - The array of context around the prompt.
   * @param {string} prompt - The raw prompt text.
   * @param {string} completionType - The type of completion (e.g., 'complete' or 'update').
   * @returns {Promise<string>} The formatted OpenAI prompt.
   */
  async getOpenAiSystemMessage(
    insertionRequest: InsertionRequestInfo
  ): Promise<ChatCompletionMessageParam[]> {
    try {
      const platform = 'openai';

      // In all the cases load the system prompt
      const systemPrompt = (this.basePrompt[platform] as SystemPromptPlatformInfo).systemMessage;
      const codeContext = this.getCodeContext(insertionRequest.filePath);
      const instructions = this.getInstructions(platform);

      let format = '';
      let contextPrompt = '';

      contextPrompt = (this.basePrompt[platform] as SystemPromptPlatformInfo).context;
      format = (this.basePrompt[platform] as SystemPromptPlatformInfo).format;

      const systemContent = `${systemPrompt}\n Instructions:${instructions}\n${format}\n${contextPrompt}:\n${codeContext}`;
      const systemMessage: ChatCompletionMessageParam = {
        role: 'system',
        content: systemContent
      };

      const userMessage: ChatCompletionMessageParam = {
        role: 'user',
        content: insertionRequest.prompt
      };

      console.log(`\nSYSTEM ${systemMessage.content}\n`);

      return [systemMessage, userMessage] as ChatCompletionMessageParam[];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating OpenAI prompt: ${error.message}`);
      }
      throw error; // Re-throw the error for further handling
    }
  }

  /**
   * Generates a formatted string containing the file content and user prompt.
   *
   * @param contextArray - An array of strings representing the context (e.g., lines of code)
   *                      relevant to the user prompt.
   * @returns A formatted string that includes the first element of contextArray and the user prompt.
   */
  private getCodeContext(filePath: string): string {
    const contextInformation: string[] = [];
    const currentFile = fs.readFileSync(filePath, 'utf-8');
    contextInformation.push(currentFile);
    return contextInformation.join('\n');
  }

  /**
   * Retrieves instructions based on the completion type and platform.
   *
   * @param completionType - A string indicating the type of completion requested
   *                         (e.g., "update" or "complete").
   * @param platform - A string representing the platform for which instructions are to be retrieved.
   * @returns A string containing the instructions relevant to the specified completion type and platform.
   */
  private getInstructions(platform: string): string {
    let instructionList = [];
    instructionList = (this.basePrompt[platform] as SystemPromptPlatformInfo).instructions;
    return instructionList.join('');
  }
}

export const systemPromptServiceImpl = SystemPromptServiceImpl.getInstance();
