const fs = require('fs');
const path = require('path');
const DirectoryHelper = require('../../core/helpers/help.directory');

/**
 * The `Initialize` class is responsible for setting up the initial configuration for the `oi` CLI application.
 * It handles the creation of the project configuration file (`oi-config.json`), manages the ignore list for files
 * the user doesn't want tracked, and provides instructions on how to proceed with the setup. It also offers a dry-run option.
 *
 * Responsibilities:
 * - Display ASCII art to indicate successful initialization.
 * - Add files to the ignore list in the configuration.
 * - Create and initialize the project configuration, including default and user-specified options.
 * - Perform a dry run of the initialization process without making changes.
 */
class Initialize {
  /**
   * Displays ASCII art in the console to indicate successful project initialization
   * and provides the next steps the user needs to take after initialization.
   */
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

  /**
   * Adds specified files to the ignore list in the configuration file (`oi-config.json`).
   * 
   * @param {string|string[]} files - A file or an array of files to add to the ignore list.
   */
  addIgnoreFiles = (files) => {
    const configPath = DirectoryHelper.getFilePath(false);

    // Check if oi-config.json exists
    if (!DirectoryHelper.configExists()) {
      console.error(`Error: oi-config.json not found at ${configPath}`);
      process.exit(1);
    }

    try {
      // Read the current configuration file
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      // Ensure 'ignore' field exists in the configuration
      if (!Array.isArray(config.ignore)) {
        config.ignore = [];
      }

      // Convert a single file string into an array
      if (typeof files === 'string') {
        files = [files];
      }

      // Add each file to the ignore list if it is not already present
      files.forEach(file => {
        if (!config.ignore.includes(file)) {
          config.ignore.push(file);
          console.log(`Added ${file} to ignore list.`);
        } else {
          console.log(`${file} is already in the ignore list.`);
        }
      });

      // Write the updated configuration back to oi-config.json
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('Updated oi-config.json with new ignore files.');
    } catch (error) {
      console.error(`Error updating oi-config.json: ${error.message}`);
    }
  };

  /**
   * Initializes the project by creating the configuration file (`oi-config.json`)
   * and setting up ignore files, project name, and other options. If the project 
   * is already initialized, it will stop the process.
   * 
   * @param {object} options - Configuration options such as project name, ignore list, verbose mode, and dry run.
   */
  initializeProject = async (options) => {
    try {
      // Determine the output path for the configuration file
      const outputPath = options.output || path.join(process.cwd(), 'oi-config.json');
      const ignoreFiles = options.ignore || [];
      const verbose = options.verbose || false;
      const projectName = options.projectName || 'default-project';
      const dryRun = options.dryRun || false;

      // Verbose mode: Display the initialization options
      if (verbose) {
        console.log(`Initializing project with the following options:`);
        console.log(`Config file: ${outputPath}`);
        console.log(`Ignore files: ${ignoreFiles.join(', ')}`);
        console.log(`Verbose output: ${verbose}`);
        console.log(`Project name: ${projectName}`);
        console.log(`Dry run: ${dryRun}`);
      }

      // Perform a dry run: No changes are made to the filesystem
      if (dryRun) {
        console.log(`Dry run enabled. No changes will be made.`);
        return;
      }

      // Check if the project has already been initialized (config file exists)
      if (fs.existsSync(outputPath)) {
        console.log(`Already initialised oi in project..`);
        process.exit(1);
      }

      // Default ignore files, including config and dependency files, and common directories
      const defaultIgnoreFiles = ['oi-config.json', 'oi-dependency.json', '/(^|[/\\])../', 'node_modules', '*.swp'];

      // Combine user-specified ignore files with default ignore files (removing duplicates)
      const combinedIgnoreFiles = [...new Set([...ignoreFiles, ...defaultIgnoreFiles])];

      // Create the configuration object for the project
      const config = {
        projectName: projectName,
        ignore: combinedIgnoreFiles,
        dependency: "oi-dependency.json",
      };

      // Ensure required directories exist
      await DirectoryHelper.makeRequiredDirectories();

      try {
        // Create directories recursively if they don't exist
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Write the configuration file to disk
        fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
        console.log(`Project initialized with config at ${outputPath}`);

        // Display ASCII art and instructions after initialization
        this.displayAsciiArt();
      } catch (error) {
        console.error(`Error creating config file: ${error.message}`);
        process.exit(1);
      }

      // Additional initialization logic can go here
      if (verbose) {
        console.log('Initialization complete.');
      }
    } catch (error) {
      console.error(`Error initializing project: ${error.message}`);
    }
  };
}

module.exports = new Initialize(); // Export an instance of the Initialize class
