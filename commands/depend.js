// Import required modules
const path = require('path');
const fs = require('fs');
const network = require('../service/network');
const configFS = require('../utils/utils');

const parseDependencyJson = (response) => {
    try {
        // Ensure the response has the correct structure
        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error("Response is not in the expected format or is empty.");
        }
  
        // Extract the message content from the first choice
        const message = response.choices[0].message;
  
        if (!message || !message.content) {
            throw new Error("Message content is missing in the response.");
        }
  
        // Clean the message content to remove any Markdown formatting
        let cleanContent = message.content
            .replace(/```json/g, '')  // Remove the opening code block for JSON
            .replace(/```/g, '')      // Remove the closing code block
            .trim();                  // Trim any remaining whitespace
  
        // Attempt to parse the cleaned content as JSON
        const dependencyGraph = JSON.parse(cleanContent);
  
        // Output or use the parsed dependency graph
        console.log("Parsed Dependency Graph:", dependencyGraph);
        return dependencyGraph;
    } catch (error) {
        console.error("Error parsing the response:", error.message);
        return null; // Return null or handle the error appropriately
    }
};

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

    const dependencyGraph = parseDependencyJson(response);

    if (verbose) {
        console.log('Received dependency graph:');
        console.log(JSON.stringify(response, null, 2));
    }

    return dependencyGraph;
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
