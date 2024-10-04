const fs = require('fs');
const path = require('path');

const displayAsciiArt = () => {
  console.log(`
  ____    _      
 / __ \\  |_|       
| |  | |  _
| |  | | | | 
| |__| | | |
 \\____/  |_|
                 
  `);
  console.log("Oi at your service!");
  console.log("Next steps:");
  console.log("1. Start the local server.");
  console.log("2. Run 'oi depend' to generate the dependency graph.");
  console.log("3. Use 'oi config' to define the model name");
  console.log("4. If you have specific prompts, you can run 'oi code' to generate code based on them.");
  console.log("5. For continuous code generation in real-time, run 'oi start' to watch the project.");
};

const initializeProject = (options) => {
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

  // Add ignored files.
  ignoreFiles.push("oi-config.json");
  ignoreFiles.push("oi-dependency.json");

  // Add additional patterns to ignore temporary and backup files (like VS Code's autosave)
  ignoreFiles.push('/(^|[/\\])../'); // Ignore dotfiles and hidden files
  ignoreFiles.push('node_modules'); // Ignore node_modules folder
  ignoreFiles.push('*.swp'); // Ignore temporary swap files

  // Create the configuration file
  const config = {
    projectName: projectName,
    ignore: ignoreFiles,
    dependency: "oi-dependency.json",
    port: 11434,
    host: "http://localhost",
    model: "deepseek-coder"
  };

  try {
    // Create directories if they do not exist
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the configuration file
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
    console.log(`Project initialized with config at ${outputPath}`);
    displayAsciiArt(); // Show ASCII art and instructions
  } catch (error) {
    console.error(`Error creating config file: ${error.message}`);
    process.exit(1);
  }

  // Additional initialization logic can go here
  if (verbose) {
    console.log('Initialization complete.');
  }
};

module.exports = { initializeProject };