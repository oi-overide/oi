import { ConfigOption } from '../models/model.options';
import {
  GlobalConfig,
  LocalConfig,
  platformQuestions,
  supportedLanguages,
  supportedPlatforms
} from '../models/model.config';
import CommandHelper from '../utilis/util.command.config';
import OiCommand from './abstract.command';
import { Command } from 'commander';
import inquirer, { Question } from 'inquirer';
import serviceParser from '../services/service.parser';

/**
 * The `Config` class is responsible for handling both global and local configurations
 * for the `overide` CLI application. It manages configuration settings for different platforms
 * (like OpenAI and DeepSeek) and allows users to select an active platform, update config
 * details, and manage ignored files and project-specific settings.
 *
 * Responsibilities:
 * - Prompt the user for platform-specific configuration details.
 * - Manage global configuration, including setting the active platform and updating platform settings.
 * - Handle local configuration updates, including project name and ignored files.
 * - Ensure that required directories and configuration files exist.
 */
class Config extends OiCommand {
  public supportedLanguages: string[];
  public platforms: string[];
  public platformQuestions: { [platform: string]: Question[] };

  constructor(program: Command) {
    super(program); // Pass the program instance to the parent constructor

    this.supportedLanguages = supportedLanguages;

    // Define supported platforms and their respective configuration prompts
    this.platforms = supportedPlatforms;

    // Configuration questions for each platform (OpenAI, DeepSeek, Groq)
    this.platformQuestions = platformQuestions;
  }

  configureCommand(): void {
    const configCommand = this.program
      .command('config')
      .description('Update Local or Global settings');

    configCommand
      .command('local') // Sub-command for local configuration
      .description('Local configuration options')
      .option('-i, --ignore <files...>', 'Ignore specific files or directories')
      .option('-n, --name <name>', 'Set project name')
      .action(async options => {
        // Ensure that required directories exist
        await CommandHelper.makeRequiredDirectories();

        if (Object.keys(options).length === 0) {
          configCommand.outputHelp();
        } else {
          await this.handleLocalConfig(options);
        }
      });

    configCommand
      .command('global') // Sub-command for global configuration
      .description('Global configuration options')
      .option('-pa, --parser', 'Installs tree-sitter parsers')
      .option('-p, --platform', 'Set global variable like API keys and org IDs')
      .option('-sa, --set-active', 'Select active platform')
      .action(async options => {
        // Ensure that required directories exist
        await CommandHelper.makeRequiredDirectories();

        if (Object.keys(options).length === 0) {
          configCommand.outputHelp();
        }
        if (options.parser) {
          await this.handleParserInstall();
        }
        if (options.platform) {
          await this.handleAddActivePlatform();
        }
        if (options.setActive) {
          await this.handleChangeActivePlatform();
        }
      });
  }

  async handleParserInstall(): Promise<void> {
    try {
      // Prompt the user to select a platform to activate
      const { selectedLanguage } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedLanguage',
          message: 'Select the platform you want to activate:',
          choices: this.supportedLanguages
        }
      ]);

      const languageName = selectedLanguage.toLowerCase().trim();
      // Ensure tree-sitter is installed.
      await serviceParser.installTreeSitter(languageName);
    } catch (error) {
      console.error('Failed to install Tree-sitter parser:', error);
    }
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
    const existingConfig = (await CommandHelper.readConfigFileData(true)) as GlobalConfig;

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
    await CommandHelper.writeConfigFileData(true, updatedConfig);
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
      ? await CommandHelper.readConfigFileData(true)
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
    await CommandHelper.writeConfigFileData(true, updatedConfig);

    console.log('Run `overide config  -sa | --set-active` to select active platform');
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

    if (!CommandHelper.dependencyFileExists()) {
      console.error(
        'Dependency file (oi-dependency.json) not found. Run `overide init` to initialize the project.'
      );
      process.exit(1); // Exit if the dependency file is not found
    }

    // Read the local configuration
    const config: LocalConfig = (await CommandHelper.readConfigFileData()) as LocalConfig;

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
    }

    // Update the project name if provided in options
    if (options.name) {
      config.projectName = options.name;
    }

    // Save the updated local configuration
    await CommandHelper.writeConfigFileData(false, config);
    console.log('Local config updated successfully.');
  }
}

export default Config;
