const fs = require('fs');
const DirectoryHelper = require('../helpers/help.directory');
const { default: inquirer } = require('inquirer');

class Config {

  // Handle global Config.
  async handleGlobalConfig() {
    inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'OpenAI API Key'        
      },
      {
        type: 'input',
        name: 'orgId',
        message: 'OpenAI Organisation ID'        
      },
    ]).then(async (answer) => {
      // Get the Global config file path.
      const configDirPath = DirectoryHelper.getGlobalConfigDirPath();
      
      // Check if it exists.
      if(!DirectoryHelper.globalConfigDirExists()) {
        console.log("Global config directory does not exist. Creating...");
        fs.mkdirSync(configDirPath, {recursive: true});
      }

      const configFilePath = DirectoryHelper.getGlobalConfigFilePath();
      // Check if the file exists.
      if(!DirectoryHelper.globalConfigFileExists()) {
        fs.writeFileSync(configFilePath, JSON.stringify(answer, null, 2));
        console.log("Global config created.", configFilePath);
      } else {
        // Read the content and update it.
        try {
          const values = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
          values.apiKey = answer.apiKey;
          values.orgId = answer.orgId;
          fs.writeFileSync(configFilePath, JSON.stringify(values, null, 2));
          console.log("Global config updated.");
        } catch (e) {
          console.log(e);
          console.log("Global config cannot be updated.");
        }
      }
    });
  }

  // Handle local Config.
  async handleLocalConfig(options) {
    const configPath = DirectoryHelper.getConfigFilePath();

    // Load the oi-config.json file
    if (!DirectoryHelper.configExists()) {
      console.error("oi-config.json not found in the current directory.");
      process.exit(1);
    }

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    catch (error) {
      console.error("Error reading config file:", error);
      process.exit(1);
    }

    // Add ignore files.
    if (options.ignore && options.ignore.length > 0) {
      // Get the path to the oi-config.json file

      const ignoreFiles = options.ignore;

      // Add ignore files, avoiding duplicates
      ignoreFiles.forEach(file => {
        const trimmedFile = file.trim(); // Remove any extra whitespace
        if (!config.ignore.includes(trimmedFile)) {
          config.ignore.push(trimmedFile); // Push to the correct `ignore` array
          console.log(`Added "${trimmedFile}" to ignored files.`);
        } else {
          console.log(`"${trimmedFile}" is already in the ignored files list.`);
        }
      });
    }


    if (options.projectName) {
      config.projectName = options.projectName;
    } 

    // Save the updated config back to the file
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log("Config updated successfully.");
    } catch (error) {
      console.error("Error writing to config file:", error);
      process.exit(1);
    } 
  }

  // Handle Config.
  async config(options) {
    if (!options.global) {
      this.handleLocalConfig(options);
      return;
    }

    this.handleGlobalConfig();
  }
}


module.exports = new Config();