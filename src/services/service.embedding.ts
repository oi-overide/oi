import CommandHelper from '../utilis/util.command.config';
import { ActivePlatformDetails } from '../models/model.config';
import { DependencyGraph } from '../models/model.depgraph';
import serviceNetwork from './service.network';
import serviceDev from './service.dev';

abstract class EmbeddingService {}

class EmbeddingServiceImpl extends EmbeddingService {
  /**
   * Generates Embeddings for the given dependency graph.
   *
   * @param graph - The dependency graph node.
   * @param embeddingServiceDetails - Platform details for OpenAI.
   * @returns - Updated dependency graph node with embeddings.
   */
  async getEmbeddingsForDepGraph(graph: DependencyGraph): Promise<DependencyGraph> {
    try {
      // Is embedding is disabled return the graph without any change.
      const isEmbeddingEnabled = CommandHelper.isEmbeddingEnabled();
      if (!isEmbeddingEnabled) {
        return graph;
      }

      // Get the embedding service detail
      const activeServiceDetail: ActivePlatformDetails | null =
        CommandHelper.getActiveServiceDetails(true);

      if (!activeServiceDetail) {
        console.error('Open AI service details not found!');
        return graph;
      }

      // Get the dependency graph.
      for (const functions of graph.functions) {
        functions.embeddings = await serviceNetwork.getCodeEmbedding(
          functions.code,
          activeServiceDetail
        );
      }

      return graph;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      }
      return graph;
    }
  }

  /**
   * Generates a contextual prompt and gets embeddings for that.
   *
   * @param {string} prompt - Prompt entered by the user
   * @param fileContent  - File contents with the prompt.
   * @returns {number[]} - Embeddings for the prompt
   */
  async getEmbeddingForPrompt(prompt: string, fileContent: string): Promise<number[]> {
    const platformDetails = CommandHelper.getActiveServiceDetails(true);

    if (!platformDetails) {
      return [];
    }

    const fileLines = fileContent.split('\n');
    const promptIndex = serviceDev.findMatchingIndex(fileLines, prompt.split('\n'));
    const remainingLines = fileLines.length - promptIndex - 1;
    let lastIndex = fileLines.length - 1;

    if (remainingLines > 5) {
      lastIndex = promptIndex + 5;
    }

    const finalPromtArry = [];

    for (let i = promptIndex - 5; i < lastIndex; i++) {
      finalPromtArry.push(fileLines[i]);
    }

    const promptString = finalPromtArry.join('\n');

    return await serviceNetwork.getCodeEmbedding(promptString, platformDetails);
  }

  /**
   * Checks the similarity of two vector embeddings.
   * @param vec1 - Embedding prompt
   * @param vec2 - Embedding for the functions.
   * @returns {number} - Similarity factor.
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must be of the same length');
    }

    // Calculate the dot product safely
    const dotProduct = vec1.reduce((sum, value, index) => sum + value * vec2[index]!, 0);

    const normVec1 = Math.sqrt(vec1.reduce((sum, value) => sum + value * value, 0));
    const normVec2 = Math.sqrt(vec2.reduce((sum, value) => sum + value * value, 0));

    if (normVec1 === 0 || normVec2 === 0) {
      throw new Error('Vectors must not be zero-vectors');
    }

    return dotProduct / (normVec1 * normVec2);
  }
}

export default new EmbeddingServiceImpl();
