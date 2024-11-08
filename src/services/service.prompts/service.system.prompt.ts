import fs from 'fs';

// Loading JSON structure into a variable
import { ChatCompletionMessageParam } from 'openai/resources';
import promptStructure from '../../../assets/prompt.structure.json';
import {
  InsertionRequestInfo,
  SystemPromptInfo,
  SystemPromptPlatformInfo
} from '../../models/model.prompts';
import { ChatCompletionMessageParam as GroqChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import serviceParser from '../service.parser';
import { DependencyGraph } from '../../models/model.depgraph';

abstract class SystemPromptService {
  abstract getOpenAiSystemMessage(
    insertionRequest: InsertionRequestInfo
  ): Promise<ChatCompletionMessageParam[]>;

  abstract getDeepSeekSystemMessage(
    insertionRequest: InsertionRequestInfo
  ): Promise<ChatCompletionMessageParam[]>;

  abstract getGroqSystemMessage(
    insertionRequest: InsertionRequestInfo
  ): Promise<GroqChatCompletionMessageParam[]>;
}

class SystemPromptServiceImpl extends SystemPromptService {
  private basePrompt: SystemPromptInfo;

  constructor() {
    super();
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

      return [systemMessage, userMessage] as ChatCompletionMessageParam[];
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
   * @returns {Promise<ChatCompletionMessageParam>} The formatted DeepSeek prompt.
   */
  async getDeepSeekSystemMessage(
    insertionRequest: InsertionRequestInfo
  ): Promise<ChatCompletionMessageParam[]> {
    try {
      const platform = 'deepseek';

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

      return [systemMessage, userMessage] as ChatCompletionMessageParam[];
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
  async getGroqSystemMessage(
    insertionRequest: InsertionRequestInfo
  ): Promise<GroqChatCompletionMessageParam[]> {
    try {
      const platform = 'groq';

      // In all the cases load the system prompt
      const systemPrompt = (this.basePrompt[platform] as SystemPromptPlatformInfo).systemMessage;
      const codeContext = this.getCodeContext(insertionRequest.filePath);
      const instructions = this.getInstructions(platform);

      let format = '';
      let contextPrompt = '';

      contextPrompt = (this.basePrompt[platform] as SystemPromptPlatformInfo).context;
      format = (this.basePrompt[platform] as SystemPromptPlatformInfo).format;

      const systemContent = `${systemPrompt}\n Instructions:${instructions}\n${format}\n${contextPrompt}:\n${codeContext}`;
      const systemMessage: GroqChatCompletionMessageParam = {
        role: 'system',
        content: systemContent
      };

      const userMessage: GroqChatCompletionMessageParam = {
        role: 'user',
        content: insertionRequest.prompt
      };

      return [systemMessage, userMessage] as GroqChatCompletionMessageParam[];
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
   * @returns A formatted string that includes the first element of contextArray and the user prompt.
   */
  private getCodeContext(filePath: string): string {
    const contextGraph: DependencyGraph[] = serviceParser.buildContextGraph(filePath);
    const contextInformation: string[] = [];

    for (const node of contextGraph) {
      // Add file line
      contextInformation.push('File : ');
      contextInformation.push(node.path);

      if (node.functions.length === 0) {
        const entireCode = fs.readFileSync(node.path, 'utf-8');
        contextInformation.push(entireCode);
        continue;
      }

      // Add class and functions
      node.functions.forEach(func => {
        if (!contextInformation.includes(func.class)) {
          contextInformation.push(func.class);
        }

        contextInformation.push(func.code);
      });
    }

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

export default new SystemPromptServiceImpl();
