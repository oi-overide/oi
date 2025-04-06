import { ReplacementBlock } from '../../models/model.response';
import serviceDev from '../service.dev';

/**
 * The `FormatResponse` class is responsible for formatting the response received from
 * AI service platforms like OpenAI, DeepSeek, and Groq. It extracts code blocks from
 * the response content and returns them for further processing.
 */
class ProcessResponse {
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
    response: string,
    verbose: boolean = false
  ): Promise<ReplacementBlock[] | null> {
    // IN case of OpenAi we receive a proper json format.
    try {
      return JSON.parse(response)['changes'] as ReplacementBlock[];
    } catch (error) {
      console.error(`Error in formatting response: ${(error as Error).message}`);
    }

    try {
      const replacementObject: ReplacementBlock[] = serviceDev.extractCodeBlock(response, verbose);
      for (const bloc of replacementObject) {
        bloc.replace = bloc.replace.filter(
          line => !line.includes('//>') || !line.includes('<//') || !line.includes('//-')
        );
      }
      return replacementObject;
    } catch (error) {
      console.log(response);
      console.error(`Error in formatting response: ${(error as Error).message}`);
      return null;
    }
  }
}

export default new ProcessResponse();
