import CommandHelper from '../core/helpers/help.commands';
import OiCommand from './abstract.command';
import { Command } from 'commander';
import inquirer, { Question } from 'inquirer';
import { ConfigOption, GlobalConfig, LocalConfig } from '../interfaces/interfaces';

/**
 * The `Config` class is responsible for handling both global and local configurations
 * for the `oi` CLI application. It manages configuration settings for different platforms
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
  public platforms: string[];
  public platformQuestions: { [platform: string]: Question[] };

  constructor(program: Command) {
    super(program); // Pass the program instance to the parent constructor

    // Define supported platforms and their respective configuration prompts
    this.platforms = ['OpenAI', 'DeepSeek', 'Groq'];

    // Configuration questions for each platform (OpenAI, DeepSeek, Groq)
    this.platformQuestions = {
      openai: [
        { type: 'input', name: 'apiKey', message: 'Enter your API key:' },
        { type: 'input', name: 'orgId', message: 'Enter your Organization ID:' }
      ],
      deepseek: [
        { type: 'input', name: 'apiKey', message: 'Enter your API key:' },
        { type: 'input', name: 'baseUrl', message: 'Enter the BaseUrl to use:' }
      ],
      groq: [{ type: 'input', name: 'apiKey', message: 'Enter your Groq API key:' }]
    };
  }

  configureCommand(): void {
    const configCommand = this.program
      .command('config')
      .description('Update Local or Global settings')
      .option('-n, --project-name <name>', 'Update project name')
      .option('-i, --ignore <files...>', 'Specify files or directories to ignore')
      .option('-g, --global', 'Set global variable like API keys and org IDs')
      .option('-sa, --set-active', 'Set active');

    // Add common options like verbose mode
    this.addCommonOptions(configCommand);

    // Define further specific command configurations, if any
    configCommand.action((options: ConfigOption) => {
      this.config(options);
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
  async handleGlobalConfig(verbose = false): Promise<void> {
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

    // Get the path to the global configuration file
    const configFilePath = CommandHelper.getConfigFilePath(true);

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

    // Verbose logging to indicate whether the config was created or updated
    if (verbose) {
      console.log(
        `${CommandHelper.configExists(true) ? 'Updated' : 'Created'} config at: ${configFilePath}`
      );
    }

    console.log('Run `oi config -sa` to select active platform');
  }

  // Handle the local configuration for the project
  async handleLocalConfig(options: ConfigOption): Promise<void> {
    // Get the path to the local configuration file
    // const configFilePath = CommandHelper.getConfigFilePath();

    // Check if the local configuration file exists
    if (!CommandHelper.configExists()) {
      console.error('Local config (oi-config.json) not found.');
      process.exit(1); // Exit if the local config is not found
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
    if (options.projectName) {
      config.projectName = options.projectName;
    }

    // Save the updated local configuration
    await CommandHelper.writeConfigFileData(false, config);
    console.log('Local config updated successfully.');
  }

  // Main config handler that determines whether global or local config should be updated
  async config(options: ConfigOption): Promise<void> {
    // Ensure that required directories exist
    // await Directo.makeRequiredDirectories();
    await CommandHelper.makeRequiredDirectories();

    // Handle switching the active platform if the `setActive` option is provided
    if (options.setActive) {
      this.handleChangeActivePlatform();
      return;
    }

    // Handle global or local configuration based on the provided options
    if (options.global) {
      await this.handleGlobalConfig(options.verbose);
    } else {
      await this.handleLocalConfig(options);
    }
  }
}

export default Config;
