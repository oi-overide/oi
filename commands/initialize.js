const fs = require('fs');
const path = require('path');
const dih = require('../helpers/help.directory');

class Initialize {
  displayAsciiArt = () => {
    console.log(`
    ____    _      
   / __ \\  |_|       
  | |  | |  _
  | |  | | | | 
  | |__| | | |
   \\____/  |_|
                   
    `);
    console.log("Oi Project initialized!");
    console.log("\nNext steps:");
    console.log("1. Use 'oi config' to define the model name, host url and port.");
    console.log("2. Run 'oi depend' to generate the dependency graph.");
    console.log("3. Run 'oi start' to start getting code suggestions.");
  };
  
  addIgnoreFiles = (files) => {
    const configPath = dih.getConfigFilePath();
  
    // Check if oi-config.json exists
    if (!dih.configExists()) {
      console.error(`Error: oi-config.json not found at ${configPath}`);
      process.exit(1);
    }
  
    try {
      // Read the current config file
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
      // Ensure 'ignore' field exists
      if (!Array.isArray(config.ignore)) {
        config.ignore = [];
      }
  
      // Convert single file string to an array
      if (typeof files === 'string') {
        files = [files];
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
    } catch (error) {
      console.error(`Error updating oi-config.json: ${error.message}`);
    }
  };
  
  initializeProject = (options) => {
    const outputPath = options.output || path.join(process.cwd(), 'oi-config.json');
    const ignoreFiles = options.ignore || [];
    const verbose = options.verbose || false;
    const projectName = options.projectName || 'default-project';
    const dryRun = options.dryRun || false;
  
    if (verbose) {
      console.log(`Initializing project with the following options:`);
      console.log(`Config file: ${outputPath}`);
      console.log(`Ignore files: ${ignoreFiles.join(', ')}`);
      console.log(`Verbose output: ${verbose}`);
      console.log(`Project name: ${projectName}`);
      console.log(`Dry run: ${dryRun}`);
    }
  
    // Perform a dry run
    if (dryRun) {
      console.log(`Dry run enabled. No changes will be made.`);
      return;
    }
  
    // Check if the project directory already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Already initialised oi in project..`)
      process.exit(1);
    }
  
    // Add default files to ignore list
    const defaultIgnoreFiles = ['oi-config.json', 'oi-dependency.json', '/(^|[/\\])../', 'node_modules', '*.swp'];
  
    // Add user specified files to ignore list
    const combinedIgnoreFiles = [...new Set([...ignoreFiles, ...defaultIgnoreFiles])]; // Ensure no duplicates
  
    // Create the configuration file
    const config = {
      projectName: projectName,
      ignore: combinedIgnoreFiles,
      dependency: "oi-dependency.json",
    };
  
    try {
      // Create directories if they do not exist
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
      // Write the configuration file
      fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
      console.log(`Project initialized with config at ${outputPath}`);
      this.displayAsciiArt(); // Show ASCII art and instructions
    } catch (error) {
      console.error(`Error creating config file: ${error.message}`);
      process.exit(1);
    }
  
    // Additional initialization logic can go here
    if (verbose) {
      console.log('Initialization complete.');
    }
  };
}



module.exports = new Initialize();