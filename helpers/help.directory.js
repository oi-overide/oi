const fs = require('fs');
const path = require('path');

class DirectoryHelper {
    static configFileName = "oi-config.json";

    /**
     * Get the content of a file.
     * @param {string} filePath 
     * @returns {string} content of the file.
     */
    async readFileContent(filePath) {
        return fs.promises.readFile(filePath, 'utf8');
    }
    
    /** 
     * Check if the oi-config.json file exists in the current directory.
     * @returns {boolean}
     */
    configExists() {
        const configFilePath = this.getConfigFilePath();
        console.log(configFilePath);
        return fs.existsSync(configFilePath);
    }

    /**
     * Check if the oi-dependency.json file exists in the current directory.
     * @returns {boolean}
     */
    dependencyExists() {
        const dependencyFilePath = this.getDependencyFilePath();
        return fs.existsSync(dependencyFilePath);
    }

    /**
     * Get the current working directory.
     * @returns {string} 
     */
    getCurrentDirectory() {
        return process.cwd(); 
    }

    /**
     * Get the path to the oi-config.json
     * @returns {string}
     */
    getConfigFilePath() {
        const currentDir = this.getCurrentDirectory();
        const filePath = path.join(currentDir, DirectoryHelper.configFileName);
        return filePath;
    }

    /**
     * Get the path to the oi-dependency.json
     * @returns {string}
     */
    async getDependencyFilePath() {
        const currentDir = this.getCurrentDirectory();
        const dependencyFileName = this.getConfigJsonValue("dependencyFile");
        const filePath = path.join(currentDir, dependencyFileName);
        return filePath;
    }

    /**
     * Get the list of the ignored files
     * @returns {[string]}
     */
    getIgnoredFiles() {
        return this.getConfigJsonValue("ignore");
    }

    /**
     * Get the value of a key in the oi-config.json
     * @param {string} key 
     * @returns {string}
     */
    getConfigJsonValue(key) {
        const configFilePath = this.getConfigFilePath();
        const configFile = fs.readFileSync(configFilePath, 'utf-8');
        const configJson = JSON.parse(configFile);
        return configJson[key];
    }

    // TODO : Add sourced files later.
    // getSourcedFiles() {
    //     return [];
    // }
}

module.exports = new DirectoryHelper();