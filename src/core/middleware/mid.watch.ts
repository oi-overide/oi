import fs from 'fs';
import path from 'path';
import CommandHelper from '../helpers/help.commands';

import chokidar, { FSWatcher } from 'chokidar';
import { FileContents, LocalConfig, StartOption } from '../../interfaces/interfaces';

/**
 * The `WatchInterface` class provides functionality to watch for file changes 
 * in a directory and gather file contents for generating a dependency graph.
 */
class WatchInterface {
    private watcher: FSWatcher | undefined;

    /**
     * Recursively gathers files in a directory, reading their contents and 
     * storing them in the provided object, while respecting ignore patterns.
     * 
     * @param dirPath - The path of the directory to scan.
     * @param fileContents - An object to store file paths and their contents.
     * @param ignoreList - List of patterns for files to ignore.
     * @param verbose - Flag to enable verbose logging.
     */
    gatherFilesRecursively(dirPath: string, fileContents: FileContents, ignoreList: string[] = [], verbose: boolean = false): void {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            // Check if file or directory should be ignored
            const shouldIgnore = ignoreList.some(ignorePattern => filePath.includes(ignorePattern));

            if (shouldIgnore) {
                if (verbose) {
                    console.log(`Skipping ignored path: ${filePath}`);
                }
                continue;
            }

            if (stat.isDirectory()) {
                if (verbose) {
                    console.log(`Entering directory: ${filePath}`);
                }
                this.gatherFilesRecursively(filePath, fileContents, ignoreList, verbose);
            } else {
                const content = fs.readFileSync(filePath, 'utf-8');
                fileContents[filePath] = content;

                if (verbose) {
                    console.log(`Read file: ${filePath}`);
                }
            }
        }
    }

    /**
     * Watches for changes in files within the current directory and its subdirectories,
     * handling added, changed, and removed files.
     * 
     * @param options - Options for configuring the watch behavior.
     */
    async watchFiles(options: StartOption): Promise<void> {
        const { verbose } = options;

        if (!CommandHelper.configExists()) {
            console.error('Error: oi-config.json file not found in the current directory.');
            process.exit(1);
        }

        const config = await CommandHelper.readConfigFileData() as LocalConfig;
        const ignoredFiles = config.ignore || [];

        const currentDir = process.cwd();

        this.watcher = chokidar.watch(currentDir, {
            persistent: true,
            usePolling: true,
            interval: 100,
            ignored: ignoredFiles,
            ignoreInitial: true,
        });

        this.watcher
            .on('add', (filePath: string) => {
                if (verbose) {
                    console.log(`File ${filePath} has been added`);
                }
            })
            .on('change', async (filePath: string) => {
                if (verbose) {
                    console.log(`File ${filePath} has been changed`);
                }
                // await ParsePrompt.findPromptInFile(filePath);
            })
            .on('unlink', (filePath: string) => {
                if (verbose) {
                    console.log(`File ${filePath} has been removed`);
                }
            })
            .on('error', (error: Error) => {
                if (verbose) {
                    console.error('Watcher error:', error);
                }
            })
            .on('ready', () => {
                if (verbose) {
                    console.log('Watcher is ready and scanning for changes');
                }
            });
    }
}

export default new WatchInterface();
