import chokidar, { FSWatcher } from 'chokidar';
import OiCommand from './abstract.command';
import configCommandUtil from '../utilis/util.command.config';
import startCommandHandlerImpl from '../handlers/handler.start';

import { StartOption } from '../models/model.options';
import { LocalConfig } from '../models/model.config';

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
  private watcher: FSWatcher | null = null;

  /**
   * Configures the `start` command, adding it to the program with any
   * required options and actions.
   */
  configureCommand(): void {
    const startCommand = this.program
      .command('start')
      .option('-p, --path <path>', 'Specify the path to the project directory')
      .description('Start watching files for prompt changes');
    this.addCommonOptions(startCommand); // Add common options such as --verbose

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
      const { verbose, path } = options;

      if (!configCommandUtil.configExists()) {
        console.error('Error: oi-config.json file not found in the current directory.');
        process.exit(1);
      }

      // get current config.
      const config = (await configCommandUtil.readConfigFileData(false, path)) as LocalConfig;
      const ignoredFiles = config.ignore || [];
      const currentDir = options.path ?? process.cwd();

      if (verbose) {
        console.log(`Watching files in directory: ${currentDir}`);
      }

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
