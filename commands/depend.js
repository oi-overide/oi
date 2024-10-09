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

    // Generate Incrementally
    generateDependencyGraphIncrementally = async (ignoredFiles, verbose) => {
        const fileContents = {};
        const dependencyContent = {};
        const projectDir = process.cwd();

        // Recursively gather all files and their contents
        directory.gatherFilesRecursively(projectDir, fileContents, ignoredFiles, verbose);

        for (const filePath in fileContents) {
            const fileContent = fileContents[filePath];

            // Follow Sliding window protocol to generate the nodes of the dependency graph.
            // This should happen one file at a time.
            // Ignore this while generating the dependency graph.
            const prompt = `
                    You are given the contents of a project files. 
                    Your task is to generate a structured JSON representation of the file's dependency graph. 
                    The JSON should represent all functions, classes, and import statements for each file. 
                    Response using JSON. 
                    There should be no whitespaces.
                    The JSON should have the following structure (STRICTLY FOLLOW THIS):
                    
                    {"language": "JavaScript","filePath": {"classes": [{"name": "class1","functions": [{"name": "func1","type": "function","parameters": {"param1": "number","param2": "string"},"returns": "boolean"}],}],"imports": ["module1", "module2", "file1", "file2"]}}

                    File path: 
                    ${filePath}

                    File contents:
                    ${fileContent}                    
                `;

            if (verbose) {
                console.log('Sending the following prompt as request:');
                console.log(prompt);
            }

            // Get the URL and Host for the model
            const url = formatRequest.model().getUrl();
            const requestObject = formatRequest.model().formatRequest(prompt);

            // Make the request 
            const response = await network.doRequest(requestObject, url);

            if (verbose) {
                console.log('Received dependency graph:');
                console.log(typeof response);
            }

            const responseContent = formatResponse.model().formatResponse(response, true);
            dependencyContent[filePath] = responseContent;

            if (verbose) {
                console.log("Updated dependency graph");
                console.log(dependencyContent);
            }
        }

        return JSON.stringify(dependencyContent);
    }


    // // Generate the dependency graph by prompting Code Llama
    generateDependencyGraph = async (ignoredFiles, verbose) => {
        const fileContents = {};
        const projectDir = process.cwd();

        // Recursively gather all files and their contents
        directory.gatherFilesRecursively(projectDir, fileContents, ignoredFiles, verbose);

        // Create an enhanced prompt for the code generation model
        // Ignore this while generating the dependency graph.
        const prompt = `
            You are given the contents of several project files. Your task is to generate a structured JSON representation of the project's dependency graph. The JSON should represent all functions, classes, and import statements for each file.
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
            ${fileContents}
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

        // // Use -o flag if provided, otherwise fall back to the dependency key in the config
        const outputFileName = args.output || config || 'oi-dependency.json';
        const verbose = args.verbose || false;

        const dependencyFilePath = path.join(process.cwd(), outputFileName);

        const modelType = dih.getConfigJsonValue('model_type');
        const ignoredFiles = await dih.getConfigJsonValue("ignore");

        // Generate the dependency graph
        if (modelType === 'ollama') {
            // Call incremental generation.
            const depJson = await this.generateDependencyGraphIncrementally(ignoredFiles, verbose);
            // Write to the specified output file
            fs.writeFileSync(dependencyFilePath, `${depJson}`);
        }

        if (modelType === 'openai') {
            const depJson = await this.generateDependencyGraph(ignoredFiles, verbose);
            // Write to the specified output file
            fs.writeFileSync(dependencyFilePath, `${depJson}`);
            if (verbose) {
                console.log(`Dependency graph generated and saved to "${outputFileName}".`);
            }
        }

        // FOR TEST
        console.log("\nTESTING\n");
        const data = JSON.parse(fs.readFileSync(dependencyFilePath, 'utf-8'));
        for (const filePath in data) {
            const fileContent = data[filePath];
            try {
                JSON.parse(fileContent);                

            } catch (e) {
                console.log(fileContent);
                console.log(e);
            }
        }
    };
}

module.exports = new Depend();