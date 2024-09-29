const { Configuration, OpenAIApi, default: OpenAI } = require('openai');

// Load environment variables (make sure to set OPENAI_API_KEY in .env file)
require('dotenv').config();

// Initialize OpenAI API with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Make sure this is in your .env
    organisation: "org-mOERFqLbspXjxY1Be37atLq2",
    project: "proj_KXJHh8FNqFn7EiKyvFjCJ32o" 
});

const processCodexResponse = (response) => {
    try {
      // Extract the content from the response
      const content = response[0].message.content;
  
      // Parse the content into JSON
      const dependencyGraph = JSON.parse(content);
  
      // Output or use the parsed dependency graph
      console.log("Parsed Dependency Graph:", dependencyGraph);
      return dependencyGraph;
    } catch (error) {
      console.error("Error parsing the response:", error.message);
      return null;
    }
  };
  

/**
 * Generate code using OpenAI Codex.
 * @param {string} prompt - The user prompt to generate code for.
 * @param {string} model - Optional. The model to use for code generation, defaults to 'gpt-3.5-turbo'.
 * @returns {string} - The generated code response.
 */
const generateCode = async (prompt, model = 'gpt-3.5-turbo') => {
    try {
        // const response = await openai.chat.completions.create({
        //     model: model,  // You can use 'gpt-3.5-turbo' or 'gpt-4'
        //     messages: [{ role: "user", content: prompt }],  // Wrap the prompt in messages array
        //     max_tokens: 1000,  // Set a limit based on how much code you want
        //     temperature: 0.5,  // Adjust to control randomness
        //     top_p: 1,
        //     frequency_penalty: 0,
        //     presence_penalty: 0,
        // });

        // Log the response for debugging
        // console.log(response.choices);

        const response = [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '{\n' +
                  '    "projectName": "oi",\n' +
                  '    "files": {\n' +
                  '        "/Users/ad/Desktop/Projects/oi/commands/code.js": {\n' +
                  '            "functions": ["codeCommand"],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["fs", "path"]\n' +
                  '        },\n' +
                  '        "/Users/ad/Desktop/Projects/oi/commands/depend.js": {\n' +
                  '            "functions": ["gatherFilesRecursively", "generateDependencyGraph", "depend"],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["path", "fs", "../service/network", "../service/config"]\n' +
                  '        },\n' +
                  '        "/Users/ad/Desktop/Projects/oi/commands/ignore.js": {\n' +
                  '            "functions": ["getConfigFilePath", "addIgnoreFiles"],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["fs", "path"]\n' +
                  '        },\n' +
                  '        "/Users/ad/Desktop/Projects/oi/commands/initialize.js": {\n' +
                  '            "functions": ["displayAsciiArt", "initializeProject"],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["fs", "path"]\n' +
                  '        },\n' +
                  '        "/Users/ad/Desktop/Projects/oi/index.js": {\n' +
                  '            "functions": [],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["commander", "./commands/initialize", "./commands/code", "./commands/depend", "./commands/ignore"]\n' +
                  '        },\n' +
                  '        "/Users/ad/Desktop/Projects/oi/service/config.js": {\n' +
                  '            "functions": ["dependencyExists", "configExists", "getCurrentDirectory", "getConfigFilePath", "getDependencyFilePath", "getConfigJsonValue"],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["path", "fs"]\n' +
                  '        },\n' +
                  '        "/Users/ad/Desktop/Projects/oi/service/network.js": {\n' +
                  '            "functions": ["generateCode"],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["openai", "dotenv"]\n' +
                  '        },\n' +
                  '        "/Users/ad/Desktop/Projects/oi/service/watchmen.js": {\n' +
                  '            "functions": ["checkForPromptAndGenerate", "startWatching"],\n' +
                  '            "classes": [],\n' +
                  '            "imports": ["fs", "chokidar", "./config", "./generate"]\n' +
                  '        }\n' +
                  '    }\n' +
                  '}',
                refusal: null
              },
              logprobs: null,
              finish_reason: 'stop'
            }
          ];

        // Extract the generated text
        // const generatedCode = response.choices[0];

        const generatedCode = processCodexResponse(response);
        // console.log(`GENERATED ${generatedCode}`); // Show the generated code
        return generatedCode;
    } catch (error) {
        console.error(`Error generating code: ${error.message}`);
        throw error;
    }
};

module.exports = {generateCode};