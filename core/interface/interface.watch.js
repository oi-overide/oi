const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const DirectoryHelper = require('../helpers/help.directory');
const ParsePrompt = require('../finder/find.prompt');

/**
 * The `WatchInterface` class provides functionality to watch for file changes 
 * in a directory and gather file contents for generating a dependency graph.
 */
class WatchInterface {
    /**
     * Recursively gathers files in a directory, reading their contents and 
     * storing them in the provided object, while respecting ignore patterns.
     * 
     * @param {string} dirPath - The path of the directory to scan.
     * @param {object} fileContents - An object to store file paths and their contents.
     * @param {Array<string>} ignoreList - List of patterns for files to ignore.
     * @param {boolean} verbose - Flag to enable verbose logging.
     */
    gatherFilesRecursively = (dirPath, fileContents, ignoreList = [], verbose = false) => {
        const files = fs.readdirSync(dirPath); // Read the contents of the directory

        for (const file of files) {
            const filePath = path.join(dirPath, file); // Get the full path of the file
            const stat = fs.statSync(filePath); // Get file statistics

            // Check if the file or directory (or its parent) is in the ignore list
            const shouldIgnore = ignoreList.some(ignorePattern => filePath.includes(ignorePattern));

            if (shouldIgnore) {
                if (verbose) {
                    console.log(`Skipping ignored path: ${filePath}`); // Log ignored paths if verbose
                }
                continue; // Skip this file/directory
            }

            if (stat.isDirectory()) {
                // Recur for subdirectories
                if (verbose) {
                    console.log(`Entering directory: ${filePath}`);
                }
                this.gatherFilesRecursively(filePath, fileContents, ignoreList, verbose); // Recursive call
            } else {
                // Read and store file content
                const content = fs.readFileSync(filePath, 'utf-8');
                fileContents[filePath] = content; // Store content in the provided object

                if (verbose) {
                    console.log(`Read file: ${filePath}`); // Log file read if verbose
                }
            }
        }
    };

    /**
     * Watches for changes in files within the current directory and its subdirectories,
     * handling added, changed, and removed files.
     * 
     * @param {boolean} verbose - Flag to enable verbose logging.
     */
    async watchFiles(verbose) {
        // Ensure 'oi-config.json' exists
        if (!DirectoryHelper.configExists()) {
            console.error('Error: oi-config.json file not found in the current directory.');
            process.exit(1); // Exit if the config file is missing
        }

        // Read ignored files from 'oi-config.json'
        const ignoredFiles = await (DirectoryHelper.getConfigJsonValue('ignore')) || [];

        // Get the current directory
        const currentDir = process.cwd();

        // Watch all files recursively with polling
        this.watcher = chokidar.watch(`${currentDir}`, {
            persistent: true,
            usePolling: true,      // Enable polling to catch all file changes in editors
            interval: 100,         // Polling interval (100ms works well in most cases)
            ignored: ignoredFiles, // Files or directories to ignore
            ignoreInitial: true,   // Watch initial files
        });

        // Event listeners for file changes
        this.watcher
            .on('add', async (filePath) => {
                if (verbose) {
                    console.log(`File ${filePath} has been added`); // Log added files if verbose
                }
            })
            .on('change', async (filePath) => {
                if (verbose) {
                    console.log(`File ${filePath} has been changed`); // Log changed files if verbose
                }                
                // Parse and update dependency graph for the changed file
                await ParsePrompt.findPromptInFile(filePath);
            })
            .on('unlink', filePath => {
                if (verbose) {
                    console.log(`File ${filePath} has been removed`); // Log removed files if verbose
                }
            })
            .on('error', (error) => {
                if (verbose) {
                    console.error('Watcher error:', error); // Log any watcher errors if verbose
                }
            })
            .on('ready', () => {
                if (verbose) {
                    console.log('Watcher is ready and scanning for changes'); // Log when watcher is ready
                }
            });
    }
}

module.exports = new WatchInterface();
