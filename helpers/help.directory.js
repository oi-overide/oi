const fs = require('fs');
const path = require('path');
const os = require('os');

class DirectoryHelper {
    static configFileName = "oi-config.json";
    static globalConfigFileName = "oi-global-config.json";

    /**
     * Utility function to load configuration from the global config file.
     * @returns {object} - The configuration object containing `api_key` and/or `org_id`.
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

    // Returns the details of the currently active service.
    async getActiveServiceDetails(){
        try {
            const globalConfig = await this.loadGlobalConfig();
    
            if (!globalConfig) {
                console.error("Global config not found.");
                return null;
            }
    
            // Find the active platform
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

    // Read and parse JSON from a file
    async readJsonFile(filePath) {
        return this.readFileContent(filePath)
            .then(content => JSON.parse(content))
            .catch(error => {
                console.error(`Error reading config file: ${error.message}`);
                process.exit(1);
            });
    }

    // Write data to a JSON file
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

    // Create directories and files if they do not exist
    async makeRequiredDirectories() {
        const configDir = this.getDirectoryPath(true);
        const configFile = this.getFilePath(true);

        // Create the directory if it doesn't exist
        if (!this.directoryExists(true)) {
            fs.mkdirSync(configDir, { recursive: true });
            console.log(`Created directory: ${configDir}`);
        }

        // Create the config file if it doesn't exist
        if (!this.configExists(true)) {
            await this.writeJsonFile(configFile, {});
            console.log(`Created config file: ${configFile}`);
        }
    }

    getDirectoryPath(global){
        // If global path then return the global config directory path.
        if(global){
            return process.platform === 'win32'
            ? path.join(process.env.APPDATA, 'oi')  // Windows
            : path.join(os.homedir(), '.config', 'oi');  // Linux/macOS
        }

        // Return the current working directory.
        return process.cwd();
    }

    getFilePath(global){
        // If global path then return the global config file path.
        if(global){
            return path.join(this.getDirectoryPath(global), DirectoryHelper.globalConfigFileName);
        }
        // Return the current working directory.    
        return path.join(this.getDirectoryPath(), DirectoryHelper.configFileName);
    }

    // Check if the config file (local/global) exists
    configExists(global) {
        const configPath = this.getFilePath(global);
        return fs.existsSync(configPath);
    }

    //Check if directory exists.
    directoryExists(global){
        const directoryPath = this.getDirectoryPath(global);
        return fs.existsSync(directoryPath);
    }

    // Read file content
    async readFileContent(filePath) {
        return fs.promises.readFile(filePath, 'utf8');
    }

    // Get the list of ignored files from the config
    getIgnoredFiles() {
        return this.getConfigJsonValue('ignore');
    }

    // Get the value of a key in the oi-config.json
    async getConfigJsonValue(key) {
        const configJson = await this.readJsonFile(this.getFilePath());
        return configJson[key];
    }
}

module.exports = new DirectoryHelper();
