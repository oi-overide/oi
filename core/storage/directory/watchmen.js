const chokidar = require('chokidar');

const DirectoryHelper = require('../../../helpers/help.directory');
const ParsePrompt = require('../../parser/parse.promt');
class Watchmen {
    async watchFiles(verbose) {
        // Ensure 'oi-config.json' exists
        if (!DirectoryHelper.configExists()) {
            console.error('Error: oi-config.json file not found in the current directory.');
            process.exit(1);
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
                    console.log(`File ${filePath} has been added`);
                }
            })
            .on('change', async (filePath) => {
                if(verbose) {
                    console.log(`File ${filePath} has been changed`);
                }                
                // Parse and update dependency graph for the added file
                await ParsePrompt.parseFile(filePath);
            })
            .on('unlink', filePath => {
                if(verbose) {
                    console.log(`File ${filePath} has been removed`);
                }
            })
            .on('error', (error) => {
                if(verbose) {
                    console.error('Watcher error:', error);
                }
            })
            .on('ready', () => {
                if(verbose) {
                    console.log('Watcher is ready and scanning for changes');
                }
            });
    }
}

module.exports = new Watchmen();