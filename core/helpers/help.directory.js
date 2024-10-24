const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * The `DirectoryHelper` class is responsible for managing configuration files and directories
 * for the Oi application. It handles the creation, reading, writing, and validation of
 * configuration files (local and global) and provides utility functions to access service details.
 */
class DirectoryHelper {
    // File names for configuration
    static configFileName = "oi-config.json";
    static globalConfigFileName = "oi-global-config.json";

    /**
     * Creates required configuration files if they do not already exist.
     */
    async createRequiredFiles() {
        const configFile = this.getFilePath(true);
        // Check if the global config file exists; if not, create it
        if (!this.configExists(true)) {
            await this.writeJsonFile(configFile, {});
            console.log(`Created config file: ${configFile}`);
        }
    }

    /**
     * Reads the content of a file asynchronously.
     * 
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<string>} - The content of the file as a string.
     */
    async readFileContent(filePath) {
        return fs.promises.readFile(filePath, 'utf8');
    }

    /**
     * Retrieves a list of ignored files from the configuration.
     * 
     * @returns {Array<string>} - An array of ignored file names.
     */
    getIgnoredFiles() {
        return this.getConfigJsonValue('ignore');
    }

    /**
     * Gets the value of a specific key from the local configuration file (oi-config.json).
     * 
     * @param {string} key - The key for which to retrieve the value.
     * @returns {Promise<any>} - The value associated with the specified key.
     */
    async getConfigJsonValue(key) {
        const configJson = await this.readJsonFile(this.getFilePath());
        return configJson[key];
    }

    /**
     * Checks if the specified configuration file (local or global) exists.
     * 
     * @param {boolean} global - True if checking the global config, false for local.
     * @returns {boolean} - True if the configuration file exists, false otherwise.
     */
    configExists(global) {
        const configPath = this.getFilePath(global);
        return fs.existsSync(configPath);
    }

    /**
     * Gets the file path for the configuration file (local or global).
     * 
     * @param {boolean} global - True if retrieving the global config file path.
     * @returns {string} - The full path to the configuration file.
     */
    getFilePath(global) {
        // Return the global config file path if specified
        if (global) {
            return path.join(this.getDirectoryPath(global), DirectoryHelper.globalConfigFileName);
        }
        // Return the local config file path
        return path.join(this.getDirectoryPath(), DirectoryHelper.configFileName);
    }

    /**
     * Loads the global configuration from the global config file.
     * 
     * @returns {Promise<object|null>} - The global configuration object, or null if not found.
     */
    async loadGlobalConfig() {
        try {
            // Check if the global config file exists
            if (!this.configExists(true)) {
                console.log("Global config file not found. Please run 'oi config -g' to set up.");
                return null; // Return null if config does not exist
            }

            // Load and parse the global config file
            const globalConfig = await this.readJsonFile(this.getFilePath(true), 'utf-8');
            return globalConfig; // Return the parsed configuration
        } catch (error) {
            console.error(`Error loading global config: ${error.message}`);
            throw error;
        }
    }

    /**
     * Retrieves details of the currently active service from the global configuration.
     * 
     * @returns {Promise<object|null>} - The active service details or null if not found.
     */
    async getActiveServiceDetails() {
        try {
            const globalConfig = await this.loadGlobalConfig();

            if (!globalConfig) {
                console.error("Global config not found.");
                return null;
            }

            // Find the active platform in the global config
            const activePlatform = Object.keys(globalConfig).find(platform => globalConfig[platform].isActive);

            if (activePlatform) {
                const activeServiceDetails = globalConfig[activePlatform];
                return { platform: activePlatform, details: activeServiceDetails };
            } else {
                console.log("No active platform found.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching active service details:", error.message);
            return null;
        }
    }

    /**
     * Reads and parses JSON data from a specified file.
     * 
     * @param {string} filePath - The path to the JSON file.
     * @returns {Promise<object>} - The parsed JSON object.
     */
    async readJsonFile(filePath) {
        return this.readFileContent(filePath)
            .then(content => JSON.parse(content))
            .catch(error => {
                console.error(`Error reading config file: ${error.message}`);
                process.exit(1);
            });
    }

    /**
     * Writes data to a specified JSON file.
     * 
     * @param {string} filePath - The path of the file to write to.
     * @param {object} data - The data to write to the file.
     */
    async writeJsonFile(filePath, data) {
        return fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
            .then(() => {
                console.log(`Config file updated at: ${filePath}`);
            })
            .catch(error => {
                console.error(`Error writing config file: ${error.message}`);
                process.exit(1);
            });
    }

    /**
     * Creates necessary directories and files if they do not exist.
     */
    async makeRequiredDirectories() {
        const configDir = this.getDirectoryPath(true);

        // Create the directory if it doesn't exist
        if (!this.directoryExists(true)) {
            fs.mkdirSync(configDir, { recursive: true });
            console.log(`Created directory: ${configDir}`);
        }
    }

    /**
     * Gets the directory path for the configuration files (local or global).
     * 
     * @param {boolean} global - True if retrieving the global config directory path.
     * @returns {string} - The path to the configuration directory.
     */
    getDirectoryPath(global) {
        // Return the global config directory path if specified
        if (global) {
            return process.platform === 'win32'
                ? path.join(process.env.APPDATA, 'oi')  // Windows
                : path.join(os.homedir(), '.config', 'oi');  // Linux/macOS
        }

        // Return the current working directory for local config
        return process.cwd();
    }

    /**
     * Checks if the specified directory exists.
     * 
     * @param {boolean} global - True if checking the global config directory, false for local.
     * @returns {boolean} - True if the directory exists, false otherwise.
     */
    directoryExists(global) {
        const directoryPath = this.getDirectoryPath(global);
        return fs.existsSync(directoryPath);
    }

    async writeFileContent(filePath, content) {
        return fs.promises.writeFile(filePath, content, 'utf-8')
            .then(() => {
                console.log(`File updated at: ${filePath}`);
            })
            .catch(error => {
                console.error(`Error writing file: ${error.message}`);
                process.exit(1);
            });
    }
}

module.exports = new DirectoryHelper();
