import { ReplacementBlock } from '../../models/model.response';

/**
 * The `FormatResponse` class is responsible for formatting the response received from
 * OpenAI. It extracts code blocks from the response content and returns them for
 * further processing.
 */
class ProcessResponse {
  /**
   * Formats the response from OpenAI.
   *
   * @param response - The API response object.
   * @param verbose - Whether to log the formatting process.
   * @returns The formatted code block extracted from the response, or null if not found.
   */
  async formatResponse(response: string): Promise<ReplacementBlock[] | null> {
    try {
      return JSON.parse(response)['changes'] as ReplacementBlock[];
    } catch (error) {
      console.error(`Error in formatting response: ${(error as Error).message}`);
      return null;
    }
  }
}

export default new ProcessResponse();
