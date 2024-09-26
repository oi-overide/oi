const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');

const {generateCode} = require('./ollama')

// Regex to match comments that follow your pattern: //> prompt <
const commentRegex = /\/\/>\s*(.*?)\s*<\//g;

// Check for prompt message.
const checkForPromptAndGenerate = async (filePath) => {
    try {
        // Read the content of the changed file
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Find all matches of the comment pattern
        let match;
        while ((match = commentRegex.exec(fileContent)) !== null) {
            const commentText = match[1].trim(); // Extract the text inside 
            console.log(`Prompt found in ${filePath}: ${commentText}`);
            console.log(`Prompt is ${commentText}`);

            // Now you can trigger the code generation or handle the prompt in any way
            await generateCode(commentText);
        }
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
    }
};

//> Write a function to add two numbers in nodejs <//

const startWatching = () => {
    // Get the current directory
    const currentDir = process.cwd();
    const configPath = path.join(currentDir, 'oi-config.json');

    // Ensure 'oi-config.json' exists
    if (!fs.existsSync(configPath)) {
        console.error('Error: oi-config.json file not found in the current directory.');
        process.exit(1);
    }

    // Read ignored files from 'oi-config.json'
    const configFile = fs.readFileSync(configPath, 'utf8');
    const ignoredFiles = JSON.parse(configFile)['ignore'] || [];

    // Add additional patterns to ignore temporary and backup files (like VS Code's autosave)
    ignoredFiles.push('/(^|[\/\\])\../'); // Ignore dotfiles and hidden files
    ignoredFiles.push('node_modules');  // Ignore node_modules folder
    ignoredFiles.push('*.swp');         // Ignore temporary swap files

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
            console.log(`File ${filePath} has been changed`);
            await checkForPromptAndGenerate(filePath); // Handle file change
        })
        .on('unlink', filePath => {
            console.log(`File ${filePath} has been removed`);
        })
        .on('error', error => console.error('Watcher error:', error))
        .on('ready', () => console.log('Watcher is ready and scanning for changes'));
};

module.exports = { startWatching };
