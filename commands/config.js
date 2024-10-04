const dih = require('../helpers/help.directory');
const fs = require('fs');

const updateConfig = (options)=>{
    if (options.projectName) {
        updateConfigValue('projectName', options.projectName);  // Function to update project name in oi-config.json
      }
  
      if (options.port) {
        const port = parseInt(options.port, 10);
        if (isNaN(port)) {
          console.error("Invalid port number.");
          process.exit(1);
        }
        updateConfigValue('port', port);  // Function to update port number in oi-config.json
      }
  
      if (options.host) {
        updateConfigValue('host', options.host);  // Function to update host URL in oi-config.json
      }
  
      if (options.model) {
        updateConfigValue('model', options.model);  // Function to update model name in oi-config.json
      }
  
      console.log("Config updated successfully.");
}

function updateConfigValue(key, value) {
    const configPath = dih.getConfigFilePath();

    // Load the oi-config.json file
    if (!dih.configExists()) {
      console.error("oi-config.json not found in the current directory.");
      process.exit(1);
    }
  
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
    // Update the specific key in the config file
    config[key] = value;
  
    // Save the updated config back to the file
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
    console.log(`${key} updated to ${value}`);
  }

module.exports = {updateConfig};