const dih = require('../helpers/help.directory');
const fs = require('fs');
const inquirer = require('inquirer');

class Config {
  constructor(options) {  // Initialize the Config class with the provided options
    this.options = options;
    this.configPath = dih.getConfigFilePath();
    this.config = dih.getConfigJsonValue();
  }

  updateConfig = (options) => {
    if (options.projectName) {
      this.updateConfigValue('projectName', options.projectName);  // Function to update project name in oi-config.json
    }

    if (options.port) {
      const port = parseInt(options.port, 10);
      if (isNaN(port)) {
        console.error("Invalid port number.");
        process.exit(1);
      }
      this.updateConfigValue('port', port);  // Function to update port number in oi-config.json
    }

    if (options.host) {
      this.updateConfigValue('host', options.host);  // Function to update host URL in oi-config.json
    }

    if (options.model) {
      // Split the input string from -
      const values = options.model.split('~');

      const modelType = values[0].trim();
      const modelName = values[1].trim();
      this.updateConfigValue('model_type', modelType);
      this.updateConfigValue('model', modelName);      
    }

    console.log("Config updated successfully.");
  }


  // Update a specific key in the config file
  updateConfigValue(key, value) {
    // Load the oi-config.json file
    if (!dih.configExists()) {
      console.error("oi-config.json not found in the current directory.");
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));

    // Update the specific key in the config file
    config[key] = value;

    // Save the updated config back to the file
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));

    console.log(`${key} updated to ${value}`);
  }

  async handleConfigUpdate(options) {  // Handle updating the config file with the provided options
    // Interactive prompt for model selection if the --model option is provided
    if (options.model) {
      const { modelType } = await inquirer.default.prompt([
        {
          type: 'list',
          name: 'modelType',
          message: 'Select the model type:',
          choices: ['OpenAI', 'Ollama', 'Anthropic'],
        },
      ]);

      const { modelName } = await inquirer.default.prompt([
        {
          type: 'input',
          name: 'modelName',
          message: `Enter the model name for ${modelType}:`,
        },
      ]);

      // Assign the selected model type and name to options
      options.model = `${modelType.toLowerCase()}~${modelName}`;
    }

    if (options.ignore && options.ignore.length > 0) {
      this.addIgnoreFiles(options.ignore);  // Handle ignoring files as part of config
    }
    this.updateConfig(options);
  }
}

module.exports = new Config();