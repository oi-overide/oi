// Import required modules
const path = require('path');
const fs = require('fs');
const network = require('../service/network');
const configFS = require('../service/config');

// Gather files recursively
const gatherFilesRecursively = (dirPath, fileContents, ignoreList = [], verbose = false) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        // Check if the file or directory (or its parent) is in the ignore list
        const shouldIgnore = ignoreList.some(ignorePattern => filePath.includes(ignorePattern));

        if (shouldIgnore) {
            if (verbose) {
                console.log(`Skipping ignored path: ${filePath}`);
            }
            continue;
        }

        if (stat.isDirectory()) {
            // Recur for subdirectories
            if (verbose) {
                console.log(`Entering directory: ${filePath}`);
            }
            gatherFilesRecursively(filePath, fileContents, ignoreList, verbose);
        } else {
            // Read and store file content
            const content = fs.readFileSync(filePath, 'utf-8');
            fileContents[filePath] = content;

            if (verbose) {
                console.log(`Read file: ${filePath}`);
            }
        }
    }
};

// Generate the dependency graph by prompting Code Llama
const generateDependencyGraph = async (ignoredFiles, verbose) => {
    const projectDir = process.cwd();
    const fileContents = {};

    // Recursively gather all files and their contents
    gatherFilesRecursively(projectDir, fileContents, ignoredFiles, verbose);

    // // Create a prompt for Code Llama
    // const prompt = `
    //     Given the following project files and their contents, generate a JSON structure 
    //     that represents the project's dependency graph, including functions, classes, 
    //     and imports for each file:

    //     ${JSON.stringify(fileContents, null, 2)}

    //     The output should look like this:
    //     {
    //         "projectName": "example",
    //         "files": {
    //             "file1.js": {
    //                 "functions": ["func1", "func2"],
    //                 "classes": ["Class1"],
    //                 "imports": ["module1", "module2"]
    //             },
    //             ...
    //         }
    //     }
    // `;

    // Create an enhanced prompt for the code generation model
    const prompt = `
       Given the following project files and their contents, generate a JSON structure 
       that represents the project's dependency graph, including functions, classes, 
       and imports for each file. Please include the inferred type information for 
       functions (if available), and indicate the programming language in the response.

       The files use JavaScript/TypeScript. The JSON should include the following:

       {
           "projectName": "example",
           "files": {
               "file1.js": {
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
                       },
                       ...
                   ],
                   "classes": [],
                   "imports": ["module1", "module2"]
               },
               ...
           }
       }

       Here are the project files:

       ${JSON.stringify(fileContents, null, 2)}
   `;

    if (verbose) {
        console.log('Sending the following prompt as request:');
        console.log(prompt);
    }

    const response = await network.generateCode(prompt);

    if (verbose) {
        console.log('Received dependency graph from Code Llama:');
        console.log(JSON.stringify(response, null, 2));
    }

    return response;
};

// Command implementation for oi depend
const depend = async (args) => {
    if (!configFS.configExists()) {
        console.error("Error: oi-config.json not found in the current directory.");
        process.exit(1);
    }

    const config = await configFS.getConfigJsonValue("dependency");

    // Use -o flag if provided, otherwise fall back to the dependency key in the config
    const outputFileName = args.output || config || 'oi-dependency.json';
    const verbose = args.verbose || false;

    const dependencyFilePath = path.join(process.cwd(), outputFileName);

    // Check if the dependency file already exists
    if (configFS.dependencyExists()) {
        if (verbose) {
            console.log(`Dependency file "${outputFileName}" already exists.`);
        }
        return;
    }

    // Generate the dependency graph
    const ignoredFiles = await configFS.getConfigJsonValue("ignore");
    const response = await generateDependencyGraph(ignoredFiles, verbose);

    // Write to the specified output file
    fs.writeFileSync(dependencyFilePath, JSON.stringify(response, null, 2));
    if (verbose) {
        console.log(`Dependency graph generated and saved to "${outputFileName}".`);
    }
};

module.exports = { depend };
