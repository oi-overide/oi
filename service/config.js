// This will contain all the function required to generate the config file.
// Get data from the config file.

const path = require('path');
const fs = require('fs');

/**
 * Checks if the oi-dependency file exists in the root of the project.
 * @returns {bool} - Defaults to false, true if file exists.
 */
const dependencyExists = () => {
    const depPath = getDependencyFilePath();
    try {
        return fs.existsSync(depPath) || false;
    } catch (e){
        console.log(`Error: File not found in directory ${depPath}`);
        process.exit(1);
    }
}

/**
 * Checks if the oi-config file exists in the root of the project.
 * @returns {bool} - Defaults to false, true if file exists.
 */
const configExists = () => {
    const configPath = getConfigFilePath();
    try {
        return fs.existsSync(configPath) || false;
    } catch (e){
        console.log(`Error: File not found in directory ${configPath}`);
        process.exit(1);
    }
}

/**
 * Get the current working directory.
 * @returns {string} 
 */
const getCurrentDirectory = () => {
    const currentDir = process.cwd();
    return currentDir;
}

/**
 * Get the path to the oi-config.json
 * @returns {string}
 */
const getConfigFilePath = () => {
    // Get the current directory
    const currentDir = getCurrentDirectory();
    const configPath = path.join(currentDir, 'oi-config.json');
    return configPath;
}

/**
 * Get the path to the oi-dependency.json
 * @returns {string}
 */
const getDependencyFilePath = async () => {
    const currentDir = getCurrentDirectory();
    const depFileName = await getConfigJsonValue("dependency");
    const depPath = path.join(currentDir, depFileName);
    return depPath;
}

/**
 * Get the value for a key from oi-config.json
 * @param {string} key - The map[key] to get the required value  
 * @returns {dynamic} - The value for the passed key from oi-config.json
 */
const getConfigJsonValue = async (key) => {
    try {
        const configFile = fs.readFileSync(getConfigFilePath(), 'utf8');
        const jsonData = JSON.parse(configFile);

        // Check if the key exists in the jsonData object
        if (jsonData.hasOwnProperty(key)) {
            return jsonData[key];
        } else {
            throw new Error(`Key "${key}" does not exist in the configuration.`);
        }
    } catch (error) {
        console.error(`Error: Error Reading config file or key: ${error.message}`);
        return null; // or throw error depending on how you want to handle this
    } 
}

const extractCodeFromResponse = (response) => {
    try {
       // Ensure the response is valid and contains choices
       if (!response || !response.choices || response.choices.length === 0) {
        throw new Error("Invalid response format or no choices available.");
    }

        // Extract the message content from the first choice
        const messageContent = response.choices[0].message.content;

        // Remove markdown code block syntax and language tags
        const cleanedCode = messageContent
            .replace(/```[a-zA-Z]*/g, '')  // Remove any ``` with or without language tag (e.g., ```javascript)
            .replace(/```/g, '')           // Remove closing backticks
            .trim();                       // Trim any excess whitespace

        return `${cleanedCode}`;  // Return the cleaned code
    } catch (error) {
        console.error("Error extracting code from response:", error.message);
        return null;
    }
};


module.exports = {getConfigJsonValue, getConfigFilePath, configExists, getCurrentDirectory, dependencyExists, extractCodeFromResponse}