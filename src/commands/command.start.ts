import OiCommand from './abstract.command';
import WatchInterface from '../core/middleware/mid.watch';

import { Command } from 'commander';
import { StartOption } from '../interfaces/interfaces';

/**
 * The `Start` class extends `OiCommand` and is responsible for initiating
 * the file-watching mechanism that monitors specific files for changes
 * related to prompts in the `oi` project. It utilizes the `WatchInterface`
 * to handle the actual file-watching process.
 *
 * Responsibilities:
 * - Start watching files for prompt changes.
 * - Handle verbose mode for detailed logging during the watching process.
 * - Catch and handle any errors during the watch process.
 */
class Start extends OiCommand {
  constructor(program: Command) {
    super(program);
  }

  /**
   * Configures the `start` command, adding it to the program with any
   * required options and actions.
   */
  configureCommand(): void {
    const startCommand = this.program
      .command('start')
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
      // Start watching files with the verbose option
      await WatchInterface.watchFiles(options);
    } catch (error) {
      console.error('Error starting watch:', error);
    }
  }
}

export default Start;
