const fs = require('fs');
const path = require('path');

// Get the path to oi-config.json
const getConfigFilePath = () => {
  const currentDir = process.cwd();
  return path.join(currentDir, 'oi-config.json');
};

// Add files to the ignore list in oi-config.json
const addIgnoreFiles = (files) => {
  const configPath = getConfigFilePath();

  // Check if oi-config.json exists
  if (!fs.existsSync(configPath)) {
    console.error(`Error: oi-config.json not found at ${configPath}`);
    process.exit(1);
  }

  // Read the current config file
  let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // Ensure 'ignore' field exists
  if (!Array.isArray(config.ignore)) {
    config.ignore = [];
  }

  // Add new files to the ignore list if they don't already exist
  files.forEach(file => {
    if (!config.ignore.includes(file)) {
      config.ignore.push(file);
      console.log(`Added ${file} to ignore list.`);
    } else {
      console.log(`${file} is already in the ignore list.`);
    }
  });

  // Write the updated config back to oi-config.json
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('Updated oi-config.json with new ignore files.');
};

module.exports = { addIgnoreFiles };
