import { ChromaClient } from 'chromadb';
import { FunctionData } from '../models/model.depgraph';
import { LocalConfig } from '../models/model.config';

import CommandHelper from '../utilis/util.command.config';

abstract class EmbeddingService {}

class EmbeddingServiceImpl extends EmbeddingService {
  client = new ChromaClient({ path: 'http://localhost:8000' });

  generateEmbeddingIfEnabled(functions: FunctionData[]): void {
    const localConfig: LocalConfig = CommandHelper.readConfigFileData() as LocalConfig;
    if (localConfig.embeddingEnabled) {
      this.saveVectorRecord(functions);
    }
    return;
  }

  // Get the collection name.
  async getProjectName(): Promise<string> {
    return Promise.resolve('project_name');
  }

  stringifyFunctions(functions: FunctionData[]): string[] {
    const functionStrings = [];
    const idStrings = [];

    for (const func of functions) {
      functionStrings.push(`class ${func.class} -> ${func.code}`);
      idStrings.push(`${func.class}${functions.indexOf(func)}`);
    }

    return functionStrings;
  }

  // Add records from the dependency graph.
  async saveVectorRecord(functions: FunctionData[]): Promise<void> {
    // Get the project name.
    const projectName = await this.getProjectName();
    const collection = await this.client.createCollection({
      name: projectName
    });

    const stringFunctions = this.stringifyFunctions(functions);

    // Save the record.
    await collection.add({
      documents: stringFunctions,
      ids: ['id1', 'id2']
    });
  }

  // Get similar record to user prompt.
}

export default new EmbeddingServiceImpl();
