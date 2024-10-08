// Import required modules
const fs = require('fs');
const path = require('path');
const dih = require('../helpers/help.directory');
const network = require('../core/network/network');
const directory = require('../core/storage/directory/directory');
const formatRequest = require('../core/formatter/format.request');
const formatResponse = require('../core/formatter/format.response');

class Depend {
    constructor(options) {  // Initialize the Depend class with the provided options
        this.options = options;
        this.configPath = dih.getConfigFilePath();
        this.config = dih.getConfigJsonValue();
    }

    addDependencyIncrementally = async (dependency) => {
        console.log("HERE");
        const outputFileName = 'oi-dependency.json';
        const dependencyFilePath = path.join(process.cwd(), outputFileName);
        const dependencyGraph = JSON.parse(fs.readFileSync(dependencyFilePath, 'utf-8'));
        dependencyGraph.data.files[dependencyGraph.file] = dependency.data.classes;
        fs.writeFileSync(dependencyFilePath, dependency);
    }

    // // Generate the dependency graph by prompting Code Llama
    generateDependencyGraph = async (ignoredFiles, verbose) => {
        const model = dih.getConfigJsonValue('model_type');
        const projectDir = process.cwd();
        const fileContents = {};

        // Recursively gather all files and their contents
        directory.gatherFilesRecursively(projectDir, fileContents, ignoredFiles, verbose);

        if (model == "ollama") {

            for (const filePath in fileContents) {
                const fileContent = fileContents[filePath];

                // Follow Sliding window protocol to generate the nodes of the dependency graph.
                // This should happen one file at a time.
                const prompt = `
                    You are given the contents of a JavaScript file. 
                    Your task is to generate a structured JSON representation of the file's 
                    dependency graph. The JSON should represent all functions, classes, and 
                    import statements for the file.

                    The JSON should include the following structure:
                    
                    {
                        "language": "JavaScript",
                        "file1.js": {
                            "classes": [
                                {
                                    "name": "class1",
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
                                }
                            ],
                            "imports": ["module1", "module2", "file1", "file2"]
                        },
                    }     

                    File contents:
                    ${fileContent} 
                `;

                if (verbose) {
                    console.log('Sending the following prompt as request:');
                    console.log(prompt);
                }

                const requestObject = formatRequest.model().formatRequest(prompt);
                const url = formatRequest.model().getUrl();
                const response = await network.doRequest(requestObject, url);

                const dependencyGraph = formatResponse.model().formatResponse(response, true);

                if (verbose) {
                    console.log('Received dependency graph:');
                    console.log(dependencyGraph);
                }

                await this.addDependencyIncrementally(dependencyGraph);
            }
            return;
        }

        // Create an enhanced prompt for the code generation model
        const prompt = `
            You are given the contents of several project files from a JavaScript project. 
            Your task is to generate a structured JSON representation of the project's 
            dependency graph. The JSON should represent all functions, classes, and 
            import statements for each file.

            The JSON should include the following structure:

            {
                "language": "JavaScript",
                "file": "file1.js",
                "classes": [
                    {
                        "name": "class1",
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
                    }
                ],
                "imports": ["module1", "module2", "file1", "file2"]
            }

            Project file contents:
            ${JSON.stringify(fileContents)}
        `;

        if (verbose) {
            console.log('Sending the following prompt as request:');
            console.log(prompt);
        }

        const requestObject = formatRequest.model().formatRequest(prompt);
        const url = formatRequest.model().getUrl();
        const response = await network.doRequest(requestObject, url);

        const dependencyGraph = formatResponse.model().formatResponse(response, true);

        if (verbose) {
            console.log('Received dependency graph:');
            console.log(JSON.stringify(dependencyGraph, null, 2));
        }

        return dependencyGraph;
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
        fs.writeFileSync(dependencyFilePath, `${response}`);
        if (verbose) {
            console.log(`Dependency graph generated and saved to "${outputFileName}".`);
        }
    };
}

module.exports = new Depend();