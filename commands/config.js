const dih = require('../helpers/help.directory');
const fs = require('fs');

class Config {
  constructor(options) {
    this.options = options;
    this.configPath = dih.getConfigFilePath();
    this.config = dih.getConfigJsonValue();
  }

  updateConfig(options) {
    if (options.projectName) {
      this.updateConfigValue('projectName', options.projectName);
    }

    if (options.port) {
      const port = parseInt(options.port, 10);
      if (isNaN(port)) {
        console.error("Invalid port number.");
        process.exit(1);
      }
      this.updateConfigValue('port', port);
    }

    if (options.host) {
      this.updateConfigValue('host', options.host);
    }

    if (options.model) {
      // Split the input string from ~
      const values = options.model.split('~').map(value => value.trim());
      if (values.length === 2) {
        this.updateConfigValue('model_type', values[0].toLowerCase());
        this.updateConfigValue('model', values[1]);
      } else {
        console.error("Invalid model format. Use 'modelType~modelName'.");
      }
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

    let config;
    try {
      config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
    } catch (error) {
      console.error("Error reading config file:", error);
      process.exit(1);
    }

    // Update the specific key in the config file
    config[key] = value;

    // Save the updated config back to the file
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      console.log(`${key} updated to ${value}`);
    } catch (error) {
      console.error("Error writing to config file:", error);
      process.exit(1);
    }
  }

  async handleConfigUpdate(options) {
    if (options.ignore && options.ignore.length > 0) {
      this.addIgnoreFiles(options.ignore); // Placeholder for handling ignored files
    }

    this.updateConfig(options);
  }

  addIgnoreFiles(ignoreFiles) {
    // Load the oi-config.json file
    if (!dih.configExists()) {
        console.error("oi-config.json not found in the current directory.");
        process.exit(1);
    }

    let config;
    try {
        config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
    } catch (error) {
        console.error("Error reading config file:", error);
        process.exit(1);
    }

    // Initialize ignore array if it doesn't exist
    if (!Array.isArray(config.ignore)) {
        config.ignore = [];  // Change to `ignore` key instead of `ignoredFiles`
    }

    // Add new ignore files, avoiding duplicates
    ignoreFiles.forEach(file => {
        const trimmedFile = file.trim(); // Remove any extra whitespace
        if (!config.ignore.includes(trimmedFile)) {
            config.ignore.push(trimmedFile); // Push to the correct `ignore` array
            console.log(`Added "${trimmedFile}" to ignored files.`);
        } else {
            console.log(`"${trimmedFile}" is already in the ignored files list.`);
        }
    });

    // Save the updated config back to the file
    try {
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        console.log("Ignored files updated successfully.");
    } catch (error) {
        console.error("Error writing to config file:", error);
        process.exit(1);
    }
}
}


module.exports = new Config();