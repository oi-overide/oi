import { ConfigOption } from '../models/model.options';
import {
  GlobalConfig,
  LocalConfig,
  platformQuestions,
  supportedPlatforms
} from '../models/model.config';
import CommandHelper from '../utilis/util.command.config';
import OiCommand from './abstract.command';
import { Command } from 'commander';
import inquirer, { Question } from 'inquirer';
import utilParser from '../utilis/util.parser';

/**
 * The `Config` class is responsible for handling both global and local configurations
 * for the `overide` CLI application. It manages configuration settings for OpenAI
 * and allows users to update config details, and manage ignored files and project-specific settings.
 *
 * Responsibilities:
 * - Prompt the user for OpenAI configuration details.
 * - Manage global configuration, including setting the active platform and updating platform settings.
 * - Handle local configuration updates, including project name and ignored files.
 * - Ensure that required directories and configuration files exist.
 */
class Config extends OiCommand {
  public platforms: string[];
  public platformQuestions: { [platform: string]: Question[] };

  constructor(program: Command) {
    super(program); // Pass the program instance to the parent constructor

    // Define supported platforms and their respective configuration prompts
    this.platforms = supportedPlatforms;

    // Configuration questions for OpenAI
    this.platformQuestions = platformQuestions;
  }

  configureCommand(): void {
    const configCommand = this.program
      .command('config')
      .option('-e, --embedding', 'Enables embedding support')
      .description('Update Local or Global settings');

    const localConfig = configCommand
      .command('local')
      .description('Local configuration options')
      .option('-i, --ignore <files...>', 'Ignore specific files or directories')
      .option('-n, --name <name>', 'Set project name');

    const globalConfig = configCommand
      .command('global') // Sub-command for global configuration
      .description('Global configuration options')
      .option('-p, --platform', 'Set global variable like API keys and org IDs');

    configCommand.action(async options => {
      if (Object.keys(options).length === 0) {
        configCommand.outputHelp();
      }
    });

    localConfig.action(async options => {
      // Ensure that required directories exist
      await CommandHelper.makeRequiredDirectories();

      if (Object.keys(options).length === 0) {
        localConfig.outputHelp();
      } else {
        await this.handleLocalConfig(options);
      }
    });

    globalConfig.action(async options => {
      // Ensure that required directories exist
      await CommandHelper.makeRequiredDirectories();

      if (Object.keys(options).length === 0) {
        globalConfig.outputHelp();
      }
      if (options.platform) {
        await this.handleAddActivePlatform();
      }
    });
  }

  // Method to handle switching the active platform
  async handleChangeActivePlatform(): Promise<void> {
    // Get the global config file path
    // const configFilePath = CommandHelper.getConfigFilePath(true);

    // Check if the global configuration file exists
    if (!CommandHelper.configExists(true)) {
      console.error('Global config (oi-global-config.json) not found.');
      process.exit(1); // Exit the process if the config file does not exist
    }

    // Read the existing global configuration file
    const existingConfig = CommandHelper.readConfigFileData(true) as GlobalConfig;

    // Get a list of available platforms from the existing configuration
    const activePlatforms = Object.keys(existingConfig);
    if (activePlatforms.length === 0) {
      console.log('No platforms available in the global config.');
      return;
    }

    // Prompt the user to select a platform to activate
    const { selectedPlatform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPlatform',
        message: 'Select the platform you want to activate:',
        choices: activePlatforms
      }
    ]);

    // Update the active platform by setting `isActive` to true for the selected platform
    let updatedConfig: GlobalConfig = {};

    activePlatforms.forEach((platform: string) => {
      updatedConfig[platform] = {
        ...existingConfig[platform],
        isActive: platform === selectedPlatform // Set `isActive` only for the selected platform
      };
    });

    // Save the updated configuration back to the global config file
    CommandHelper.writeConfigFileData(true, updatedConfig);
    console.log(`Successfully updated the active platform to: ${selectedPlatform}`);
  }

  // Prompt user for platform-specific configuration details
  async promptPlatformConfig(platform: string): Promise<Record<string, string> | void> {
    // const prompt = inquirer.createPromptModule();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions: any = this.platformQuestions[platform];
    if (questions) {
      const answers = await inquirer.prompt(questions);
      return answers;
    } else {
      console.log(`No questions configured for platform: ${platform}`);
    }
  }

  // Handle the global configuration process
  async handleAddActivePlatform(): Promise<void> {
    // Prompt the user to choose which platform they want to configure
    const { platform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Which platform do you want to use?',
        choices: this.platforms // Present available platforms
      }
    ]);

    // Normalize the selected platform name
    const platformName = platform.toLowerCase().trim();

    // Get platform-specific answers from the user
    const answers = await this.promptPlatformConfig(platformName);

    // Check if a global config file already exists, if not initialize an empty config
    const existingConfig = CommandHelper.configExists(true)
      ? CommandHelper.readConfigFileData(true)
      : {};

    // Merge the new platform configuration with the existing config
    const updatedConfig = {
      ...existingConfig,
      [platformName]: {
        ...answers,
        isActive: Object.keys(existingConfig as GlobalConfig).length === 0 ? true : false // Set isActive for first platform
      }
    };

    // Save the updated global configuration
    CommandHelper.writeConfigFileData(true, updatedConfig);

    console.log('Run `overide config global -a | --set-active` to select active platform');
  }

  // Handle the local configuration for the project
  async handleLocalConfig(options: ConfigOption): Promise<void> {
    // Get the path to the local configuration file
    // const configFilePath = CommandHelper.getConfigFilePath();

    // Check if the local configuration file exists
    if (!CommandHelper.configExists()) {
      console.error(
        'Local config (oi-config.json) not found. Run `overide init` to initialize the project.'
      );
      process.exit(1); // Exit if the local config is not found
    }

    // Read the local configuration
    const config: LocalConfig = CommandHelper.readConfigFileData() as LocalConfig;

    // Update the list of ignored files if provided in options
    if (options.ignore) {
      options.ignore.forEach(file => {
        const trimmedFile = file.trim(); // Trim whitespace from the file name
        if (!config.ignore.includes(trimmedFile)) {
          config.ignore.push(trimmedFile); // Add the file to the ignore list if not already present
          if (options.verbose) {
            console.log(`Added "${trimmedFile}" to ignored files.`);
          }
        }
      });

      console.log('Following file will be watched:\n');
      const watching = utilParser.getAllFilePaths(process.cwd(), config.ignore);
      console.log(watching);
    }

    // Update the project name if provided in options
    if (options.name) {
      config.projectName = options.name;
    }

    // Save the updated local configuration
    CommandHelper.writeConfigFileData(false, config);
    console.log('Local config updated successfully.');
  }
}

export default Config;
