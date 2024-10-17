const DirectoryHelper = require('../helpers/help.directory');
const { default: inquirer } = require('inquirer');

class Config {
  constructor() {
    this.platforms = ["OpenAI", "DeepSeek", "Ollama"];
    this.platformQuestions = {
      openai: [
        { type: 'input', name: 'apiKey', message: 'Enter your API key:' },
        { type: 'input', name: 'orgId', message: 'Enter your Organization ID:' },
      ],
      deepseek: [
        { type: 'input', name: 'apiKey', message: 'Enter your API key:' },
        { type: 'input', name: 'baseUrl', message: 'Enter the BaseUrl to use:' },
      ],
    };
  }

  async handleChangeActivePlatform() {
    // Get the global config file path
    const configFilePath = DirectoryHelper.getFilePath(true);

    // Check if the global config exists
    if (!DirectoryHelper.configExists(true)) {
        console.error("Global config (oi-global-config.json) not found.");
        process.exit(1);
    }

    // Read the existing global config
    const existingConfig = await DirectoryHelper.readJsonFile(configFilePath);

    // Get the active platforms
    const activePlatforms = Object.keys(existingConfig);
    if (activePlatforms.length === 0) {
        console.log("No platforms available in the global config.");
        return;
    }

    // Prompt user to select a platform
    const { selectedPlatform } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedPlatform',
            message: 'Select the platform you want to activate:',
            choices: activePlatforms,
        },
    ]);

    // Update isActive status
    const updatedConfig = {};
    activePlatforms.forEach(platform => {
        updatedConfig[platform] = {
            ...existingConfig[platform],
            isActive: platform === selectedPlatform, // Set isActive to true for the selected platform
        };
    });

    // Write the updated configuration back to the global config file
    await DirectoryHelper.writeJsonFile(configFilePath, updatedConfig);
    console.log(`Successfully updated the active platform to: ${selectedPlatform}`);
}

  // Prompt user for platform-specific config details
  async promptPlatformConfig(platform) {
    return inquirer.prompt(this.platformQuestions[platform]);
  }

  // Handle global configuration
  async handleGlobalConfig(verbose = false) {
    const { platform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Which platform do you want to use?',
        choices: this.platforms,
      },
    ]);

    const platformName = platform.toLowerCase().trim();

    const answers = await this.promptPlatformConfig(platformName);

    // get the global config file path.
    const configFilePath = DirectoryHelper.getFilePath(true);

    const existingConfig = DirectoryHelper.configExists(global)
      ? await DirectoryHelper.readJsonFile(configFilePath)
      : {};

    const updatedConfig = { ...existingConfig, [platformName]: { ...answers, "isActive": Object.keys(existingConfig).length === 0 ? true : false } };
    await DirectoryHelper.writeJsonFile(configFilePath, updatedConfig);
    if (verbose) console.log(`${DirectoryHelper.configExists(configFilePath) ? 'Updated' : 'Created'} config at: ${configFilePath}`);
  }

  // Handle local configuration
  async handleLocalConfig(options) {
    const configFilePath = DirectoryHelper.getFilePath();

    if (!DirectoryHelper.configExists()) {
      console.error("Local config (oi-config.json) not found.");
      process.exit(1);
    }

    const config = await DirectoryHelper.readJsonFile(configFilePath);

    // Update ignore files
    if (options.ignore) {
      options.ignore.forEach(file => {
        const trimmedFile = file.trim();
        if (!config.ignore.includes(trimmedFile)) {
          config.ignore.push(trimmedFile);
          console.log(`Added "${trimmedFile}" to ignored files.`);
        }
      });
    }

    // Update project name
    if (options.projectName) {
      config.projectName = options.projectName;
    }

    await DirectoryHelper.writeJsonFile(configFilePath, config);
    console.log("Local config updated successfully.");
  }

  // General config handler
  async config(options) {
    await DirectoryHelper.makeRequiredDirectories();

    if (options.setActive) {
      this.handleChangeActivePlatform();
      return;
    }

    if (options.global) {
      await this.handleGlobalConfig(options.verbose);
    } else {
      await this.handleLocalConfig(options);
    }
  }
}

module.exports = new Config();
