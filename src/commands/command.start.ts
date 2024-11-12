import chokidar, { FSWatcher } from 'chokidar';
import OiCommand from './abstract.command';
import configCommandUtil from '../utilis/util.command.config';
import startCommandHandlerImpl from '../handlers/handler.start';

import { StartOption } from '../models/model.options';
import { LocalConfig } from '../models/model.config';
import { DependencyGraph, FileContents } from '../models/model.depgraph';
import serviceParser from '../services/service.parser';
import { systemPromptServiceImpl } from '../services/service.prompts/service.system.prompt';
// import serviceParser from '../services/service.parser';

/**
 * The `Start` class extends `OiCommand` and is responsible for initiating
 * the file-watching mechanism that monitors specific files for changes
 * related to prompts in the `overide` project. It utilizes the `WatchInterface`
 * to handle the actual file-watching process.
 *
 * Responsibilities:
 * - Start watching files for prompt changes.
 * - Handle verbose mode for detailed logging during the watching process.
 * - Catch and handle any errors during the watch process.
 */
class Start extends OiCommand {
  // Stores the contents of all files in the project
  private fileContents: FileContents[] = [];
  private dependencyGraph: DependencyGraph[] | null = [];
  private watcher: FSWatcher | null = null;
  hasDependencyGraph: boolean = true;

  /**
   * Configures the `start` command, adding it to the program with any
   * required options and actions.
   */
  configureCommand(): void {
    const startCommand = this.program
      .command('start')
      .description('Start watching files for prompt changes');
    this.addCommonOptions(startCommand); // Add common options such as --verbose

    // Load the dependency graph from the oi-dependency.json file
    this.dependencyGraph = configCommandUtil.loadDependencyGraph() as DependencyGraph[] | null;

    startCommand.action((options: StartOption) => this.startWatch(options));
  }

  /**
   * Starts watching files for changes related to prompts using the WatchInterface.
   *
   * @param options - The options object, which can include a verbose flag for detailed logging.
   */
  async startWatch(options: StartOption): Promise<void> {
    // const verbose = options.verbose || false;
    console.log('Watching files for prompts...');

    try {
      const { verbose } = options;

      if (!configCommandUtil.configExists()) {
        console.error('Error: oi-config.json file not found in the current directory.');
        process.exit(1);
      }

      // get current config.
      const config = (await configCommandUtil.readConfigFileData()) as LocalConfig;
      const ignoredFiles = config.ignore || [];
      const currentDir = process.cwd();

      this.watcher = chokidar.watch(currentDir, {
        persistent: true,
        usePolling: true,
        interval: 100,
        ignored: file => ignoredFiles.some(ignoredFile => file.includes(ignoredFile)),
        ignoreInitial: true
      });

      // start watching the files.
      this.watcher
        .on('add', (filePath: string) => this.onAdd(filePath, verbose))
        .on('change', (filePath: string) => this.onFileChanged(filePath, ignoredFiles, verbose))
        .on('unlink', (filePath: string) => this.onUnlink(filePath, verbose))
        .on('error', err => this.onError(err, verbose))
        .on('ready', () => this.onReady(verbose));
    } catch (error) {
      console.error('Error starting watch:', error);
    }
  }

  onAdd(filePath: string, verbose: boolean | undefined): void {
    if (verbose) {
      console.log(`File ${filePath} has been added`);
    }
  }

  async onFileChanged(
    filePath: string,
    ignoreFiles: string[],
    verbose: boolean | undefined
  ): Promise<void> {
    if (verbose) {
      console.log(`File ${filePath} has been changed`);
    }

    // Check if the dependency graph is empty
    this.hasDependencyGraph = await serviceParser.generateIncrementalDepForFile(
      filePath,
      ignoreFiles,
      verbose
    );
    if (verbose) {
      console.log('Dependency graph updated...');
    }
    systemPromptServiceImpl.setDependencyExists(this.hasDependencyGraph);

    await startCommandHandlerImpl.findPromptInFile(filePath, verbose);
  }

  onUnlink(filePath: string, verbose: boolean | undefined): void {
    if (verbose) {
      console.log(`File ${filePath} has been removed`);
    }
  }

  onError(error: Error, verbose: boolean | undefined): void {
    if (verbose) {
      console.error('Watcher error:', error);
    }
  }

  onReady(verbose: boolean | undefined): void {
    if (verbose) {
      console.log('Watcher is ready and scanning for changes');
    }
  }
}

export default Start;
