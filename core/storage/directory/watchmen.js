const chokidar = require('chokidar');
const dih = require('../../../helpers/help.directory');
const ps = require('../../parser/parser');

class Watchmen {
    async watchFiles(verbose) {
        // Ensure 'oi-config.json' exists
        if (!dih.configExists()) {
            console.error('Error: oi-config.json file not found in the current directory.');
            process.exit(1);
        }

        // Read ignored files from 'oi-config.json'
        const ignoredFiles = await (dih.getConfigJsonValue('ignore')) || [];

        // Get the current directory
        const currentDir = dih.getCurrentDirectory();

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
                if(verbose) {
                    console.log(`File ${filePath} has been added`);
                }
                await ps.parseFile(filePath);
            })
            .on('change', async (filePath) => {
                if(verbose) {
                    console.log(`File ${filePath} has been changed`);
                }
                await ps.parseFile(filePath);
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