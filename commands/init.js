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
  console.log("1. Run 'oi start' to begin watching the project.");
  console.log("2. Add code generation prompts to your files.");
  console.log("3. Run 'oi code' to generate code based on prompts.");
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
    // console.error(`Error: Config file already exists at ${outputPath}`);
    process.exit(1);
  }

  // Create the configuration file
  const config = {
    projectName: projectName,
    ignore: ignoreFiles,
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