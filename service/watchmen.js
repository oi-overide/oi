const fs = require('fs');
const chokidar = require('chokidar');
const config = require('../utils/utils');
const network = require('./network');

let lockCodeGeneration = false; // Global lock variable
let debounceTimeout = null;

const regexPrompt = /\/\/>\s*(.*?)\s*<\//; // Matches the prompt case.
const regexConfirmationWithResponse = /\/\/>\s*Accept the changes \(y\/n\):\s*([ynYN])\s*-\/\//;
const regexGeneratedBlock = /\/\/-\s*([\s\S]*?)\s*-\/\//g;

const identifyCase = (content) => {
    if (regexPrompt.test(content)) {
        return 'prompt';
    } else if (regexGeneratedBlock.test(content)) {
        return 'generatedWithConfirmation';
    } else if (regexConfirmationWithResponse.test(content)) {
        return 'confirmationWithResponse';
    }
    return null; // No match
};

const handleUserResponse = (filePath, fileContent) => {
    const match = fileContent.match(regexConfirmationWithResponse);

    if (match) {
        const userResponse = match[1].toLowerCase(); // Capture the user's response ('y' or 'n')

        if (userResponse === 'y') {
            console.log("User accepted the changes.");
            // Remove only the confirmation part and leave the code
            const updatedContent = fileContent.replace(regexConfirmationWithResponse, '');
            // Call updateFileContent with the original content and the new content
            updateFileContent(filePath, fileContent, updatedContent);
        } else if (userResponse === 'n') {
            console.log("User discarded the changes.");
            // Remove the entire block of generated code and keep the prompt
            const originalPromptMatch = fileContent.match(regexGeneratedBlock);

            console.log(originalPromptMatch[0]); // Log to check the match

            if (originalPromptMatch) {
                const originalPrompt = originalPromptMatch[0].split('\n')[0].replace('//-', '').trim(); // Extract and clean the prompt
                const updatedContent = fileContent.replace(regexGeneratedBlock, `// ${originalPrompt}`); // Reverts to the original prompt
                // Call updateFileContent with the original content and the updated content
                updateFileContent(filePath, fileContent, updatedContent); 
            } else {
                console.error(`Error: Unable to find original prompt in ${filePath}`);
            }
        }
    } else {
        console.error(`Error: Unable to match confirmation response in ${filePath}`);
    }
};

const handlePrompt = async (filePath, promptText, unprocessedPromptText) => {
    console.log(`Handling prompt: ${promptText}`);
    const response = await network.generateCode(promptText);
    const generatedCode = config.extractCodeFromResponse(response);

    // Insert the generated code into the file with the confirmation prompt
    const codeToInsert = `//- ${promptText}\n${generatedCode}\n//> Accept the changes (y/n): -/`;
    updateFileContent(filePath, unprocessedPromptText, codeToInsert); // Function to update the file with generated code.
};

const checkForPromptAndGenerate = async (filePath) => {
    if (lockCodeGeneration) {
        console.log("Code generation in progress, skipping...");
        return;
    }

    try {
        lockCodeGeneration = true; // Lock the generation to prevent concurrent runs

        // Read the file content
        let fileContent = fs.readFileSync(filePath, 'utf8');

        // Split the file content into lines to process each line individually
        const lines = fileContent.split('\n');

        for (let line of lines) {
            const caseType = identifyCase(line); // Determine the type of case

            switch (caseType) {
                case 'prompt':
                    // Get the unprocessed full prompt (including prompt chars)
                    const unprocessedPrompt = line.match(regexPrompt)[0].trim();

                    // Get the actual prompt text (content inside prompt chars)
                    const promptText = line.match(regexPrompt)[1].trim();

                    // Pass both the processed and unprocessed prompts to handlePrompt
                    await handlePrompt(filePath, promptText, unprocessedPrompt);
                    break;

                case 'generatedWithConfirmation':
                    const generatedCode = line.match(regexGeneratedWithConfirmation)[0];
                    handleGeneratedCodeWithoutResponse(filePath, generatedCode);
                    break;

                case 'confirmationWithResponse':
                    handleUserResponse(filePath, fileContent);
                    break;

                default:
                    break;
            }
        }
    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
    } finally {
        lockCodeGeneration = false; // Unlock after completion
    }
};


const updateFileContent = (filePath, oldContent, newContent) => {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    fileContent = fileContent.replace(oldContent, newContent);
    fs.writeFileSync(filePath, fileContent);
    console.log(`File ${filePath} updated successfully.`);
};

const startWatching = async () => {
    // Ensure 'oi-config.json' exists
    if (!config.configExists()) {
        console.error('Error: oi-config.json file not found in the current directory.');
        process.exit(1);
    }

    // Read ignored files from 'oi-config.json'
    const ignoredFiles = await (config.getConfigJsonValue('ignore')) || [];

    // Add additional patterns to ignore temporary and backup files (like VS Code's autosave)
    ignoredFiles.push('/(^|[\/\\])\../'); // Ignore dotfiles and hidden files
    ignoredFiles.push('node_modules'); // Ignore node_modules folder
    ignoredFiles.push('*.swp'); // Ignore temporary swap files

    // Get the current directory
    const currentDir = config.getCurrentDirectory();

    // Watch all files recursively with polling
    const watcher = chokidar.watch(`${currentDir}`, {
        persistent: true,
        usePolling: true,      // Enable polling to catch all file changes in editors
        interval: 100,         // Polling interval (100ms works well in most cases)
        ignored: ignoredFiles, // Files or directories to ignore
        ignoreInitial: true,   // Watch initial files
    });

    // Event listeners for file changes
    watcher
        .on('add', async (filePath) => {
            console.log(`File ${filePath} has been added`);
            // await uploadToOllama(filePath); // Upload newly added files to Ollama
        })
        .on('change', async (filePath) => {
            // Log file information.
            console.log(`File ${filePath} has been changed`);
            if (lockCodeGeneration) {
                return;
            }
            // Debounce the file change event to prevent multiple triggers
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                await checkForPromptAndGenerate(filePath);
            }, 1000); // Adjust the debounce delay as needed

            await checkForPromptAndGenerate(filePath); // Handle file change
        })
        .on('unlink', filePath => {
            console.log(`File ${filePath} has been removed`);
        })
        .on('error', error => console.error('Watcher error:', error))
        .on('ready', () => console.log('Watcher is ready and scanning for changes'));
};

module.exports = { startWatching };
