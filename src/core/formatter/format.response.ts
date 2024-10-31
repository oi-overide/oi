import CommandHelper from '../helpers/help.commands';
import CodeHelper from '../helpers/help.code';
// import { Completion } from 'openai/resources';
// import { CompletionType } from '../../types/type.promptInfo';

/**
 * The `FormatResponse` class is responsible for formatting the response received from
 * AI service platforms like OpenAI, DeepSeek, and Groq. It extracts code blocks from
 * the response content and returns them for further processing.
 */
class FormatResponse {
  /**
   * Formats the response based on the active service platform.
   * Calls the appropriate formatting function for OpenAI, DeepSeek, or Groq.
   *
   * @param response - The API response object.
   * @param completionType - Type of completion to aid in code extraction.
   * @param verbose - Whether to log the formatting process.
   * @returns The formatted code block extracted from the response, or null if not found.
   */
  async formatResponse(
    response: {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    },
    verbose: boolean = false
  ): Promise<string | null> {
    try {
      // Fetch details about the active AI service (platform, API key, etc.)
      const activeServiceDetails = await CommandHelper.getActiveServiceDetails();

      if (activeServiceDetails === null) {
        throw new Error('No active service found.');
      }

      // Determine which platform is active and format the response accordingly
      switch (activeServiceDetails.platform) {
        case 'openai':
          return this.formatOpenAIResponse(response, verbose);

        case 'deepseek':
          return this.formatDeepSeekResponse(response, verbose);

        case 'groq':
          return this.formatGroqResponse(response, verbose);

        default:
          throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
      }
    } catch (error) {
      console.error(`Error in formatting response: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Formats the response from OpenAI models by extracting the code block.
   *
   * @param response - The response from the OpenAI API.
   * @param completionType - Type of completion to aid in code extraction.
   * @param verbose - Whether to log details of the extracted code.
   * @returns The extracted code block, or null if no code block is found.
   */
  private formatOpenAIResponse(
    response: {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    },
    verbose: boolean
  ): string | null {
    try {
      const content = response.choices[0].message.content;
      return CodeHelper.extractCodeBlock(content, verbose);
    } catch (error) {
      console.error('Error formatting OpenAI response:', (error as Error).message);
      return null;
    }
  }

  /**
   * Formats the response from DeepSeek models by extracting the code block.
   *
   * @param response - The response from the DeepSeek API.
   * @param completionType - Type of completion to aid in code extraction.
   * @param verbose - Whether to log details of the extracted code.
   * @returns The extracted code block, or null if no code block is found.
   */
  private formatDeepSeekResponse(
    response: {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    },
    verbose: boolean
  ): string | null {
    try {
      const content = response.choices[0].message.content;
      return CodeHelper.extractCodeBlock(content, verbose);
    } catch (error) {
      console.error('Error formatting DeepSeek response:', (error as Error).message);
      return null;
    }
  }

  /**
   * Formats the response from Groq models by extracting the code block.
   *
   * @param response - The response from the Groq API.
   * @param completionType - Type of completion to aid in code extraction.
   * @param verbose - Whether to log details of the extracted code.
   * @returns The extracted code block, or null if no code block is found.
   */
  private formatGroqResponse(
    response: {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    },
    verbose: boolean
  ): string | null {
    try {
      const content = response.choices[0].message.content;
      return CodeHelper.extractCodeBlock(content, verbose);
    } catch (error) {
      console.error('Error formatting Groq response:', (error as Error).message);
      return null;
    }
  }
}

export default new FormatResponse();
