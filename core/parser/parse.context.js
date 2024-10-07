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

    getCurrentFileInfo(filePath) {
        const dependencyFilePath = dih.getDependencyFilePath();
        const dependencyFile = fs.readFileSync(dependencyFilePath, 'utf-8');
        const dependencyJson = JSON.parse(dependencyFile);

        // Return the information of the current file
        return dependencyJson[filePath] || null;
    }

    getCalledFunctions(content) {
        // Regular expression to match function calls in the content
        const functionCallRegex = /\b(\w+)\s*\(/g;
        const calledFunctions = new Set();
        let match;

        // Find all function calls in the content
        while ((match = functionCallRegex.exec(content)) !== null) {
            calledFunctions.add(match[1]); // Add function name to the set
        }

        return Array.from(calledFunctions); // Convert Set back to Array
    }

    getFunctionInfo(functionName) {
        const dependencyFilePath = dih.getDependencyFilePath();
        const dependencyFile = fs.readFileSync(dependencyFilePath, 'utf-8');
        const dependencyJson = JSON.parse(dependencyFile);

        // Search for the function info across all files
        for (const file in dependencyJson) {
            const fileInfo = dependencyJson[file];

            const functionInfo = fileInfo.functions.find(fn => fn.name === functionName);
            if (functionInfo) {
                return {
                    file: file,
                    ...functionInfo
                };
            }
        }
        return null; // Function not found
    }

    async createContext(content, filePath) {
        // Grab current file info
        const currentFileInfo = this.getCurrentFileInfo(filePath);
        console.log('Current File Info:', currentFileInfo);

        // Check the functions that are being called in this file
        const calledFunctions = this.getCalledFunctions(content);
        console.log('Called Functions:', calledFunctions);

        // Grab those function information from the dependency graph
        const functionsInfo = calledFunctions.map(fn => this.getFunctionInfo(fn));
        console.log('Functions Information:', functionsInfo);

        return content; // Returning the original content (modify as needed)
    }
}

module.exports = new Context();
