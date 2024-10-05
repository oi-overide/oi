const fs = require('fs');
const dih = require('../../helpers/help.directory');

class Context {
    
    getFileDependencies(filePath) {
        // Get the list of dependencies from oi-dependency.json
        const dependencyFilePath = dih.getDependencyFilePath();
        const dependencyFile = fs.readFileSync(dependencyFilePath, 'utf-8');
        const dependencyJson = JSON.parse(dependencyFile);

        // Get the list of files from oi-config.json
        const files = dih.getConfigJsonValue('files');

        // Check if the file is in the list of files
        if (files.includes(filePath)) {
            // Get the list of dependencies for the current file
            const dependencies = dependencyJson[filePath];

            // Check if the dependencies exist in the list of files
            if (dependencies) {
                return dependencies;
            }
        }
        return [];
    }

    async createContext(content, filePath) {
        const dependencies = this.getFileDependencies(filePath);
        console.log(dependencies);
        return content;
    }
}

module.exports = new Context();
