// Import required modules
const fs = require('fs');
const path = require('path');
const dih = require('../helpers/help.directory');
const network = require('../core/network/network');
const directory = require('../core/storage/directory/directory');

class Depend {
    constructor(options) {  // Initialize the Depend class with the provided options
        this.options = options;
        this.configPath = dih.getConfigFilePath();
        this.config = dih.getConfigJsonValue();
    }

    // // Generate the dependency graph by prompting Code Llama
    generateDependencyGraph = async (ignoredFiles, verbose) => {
        const projectDir = process.cwd();
        const fileContents = {};

        // Recursively gather all files and their contents
        directory.gatherFilesRecursively(projectDir, fileContents, ignoredFiles, verbose);

        // Create an enhanced prompt for the code generation model
        const prompt = `
            Given the following file content, generate a JSON structure that represents the file's
            dependency graph, including functions, classes, and imports. Please include the inferred
            type information for functions (if available), and indicate the programming language.

            The file uses JavaScript/TypeScript. The JSON should include the following structure:

            {
                "language": "JavaScript",
                "functions": [
                    {
                        "name": "func1",
                        "type": "function",
                        "parameters": {
                            "param1": "number",
                            "param2": "string"
                        },
                        "returns": "boolean"
                    }
                ],
                "classes": [],
                "imports": ["module1", "module2"]
            }

            File content:

            ${fileContents}
        `;

        if (verbose) {
            console.log('Sending the following prompt as request:');
            console.log(prompt);
        }

        const response = await network.doRequest(prompt);

        // const dependencyGraph = parseDependencyJson(response);

        if (verbose) {
            console.log('Received dependency graph:');
            console.log(JSON.stringify(response, null, 2));
        }

        return response;
    };

    depend = async (args) => {
        if (!dih.configExists()) {
            console.error("Error: oi-config.json not found in the current directory.");
            process.exit(1);
        }

        const config = await dih.getConfigJsonValue("dependency");

        // Use -o flag if provided, otherwise fall back to the dependency key in the config
        const outputFileName = args.output || config || 'oi-dependency.json';
        const verbose = args.verbose || false;

        const dependencyFilePath = path.join(process.cwd(), outputFileName);

        // Check if the dependency file already exists
        if (dih.dependencyExists()) {
            if (verbose) {
                console.log(`Dependency file "${outputFileName}" already exists.`);
            }
            return;
        }

        // Generate the dependency graph
        const ignoredFiles = await dih.getConfigJsonValue("ignore");
        const response = await this.generateDependencyGraph(ignoredFiles, verbose);

        // Write to the specified output file
        fs.writeFileSync(dependencyFilePath, JSON.stringify(response, null, 2));
        if (verbose) {
            console.log(`Dependency graph generated and saved to "${outputFileName}".`);
        }
    };
}

module.exports = new Depend();