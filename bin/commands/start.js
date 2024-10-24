const WatchInterface = require('../../core/interface/interface.watch');

/**
 * The `Start` class is responsible for initiating the file-watching mechanism
 * that monitors specific files for changes related to prompts in the `oi` project.
 * It utilizes the `WatchInterface` to handle the actual file-watching process.
 *
 * Responsibilities:
 * - Start watching files for prompt changes.
 * - Handle verbose mode for detailed logging during the watching process.
 * - Catch and handle any errors during the watch process.
 */
class Start {
    /**
     * Starts watching files for changes related to prompts using the WatchInterface.
     * 
     * @param {object} options - The options object, which can include a verbose flag for detailed logging.
     */
    async startWatch(options) {
        const verbose = options.verbose || false; // Enable verbose mode if provided
        console.log('Watching files for prompts...');

        try {
            // Use the WatchInterface to start watching files, passing the verbose option
            await WatchInterface.watchFiles(verbose);
        } catch (error) {
            // Handle any errors that occur during the watch process
            console.error("Error starting watch:", error);
        }
    }
}

// Export an instance of the Start class
module.exports = new Start();
