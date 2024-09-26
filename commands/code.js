const { generateCode } = require('../utils/ollama');
const fs = require('fs');
const path = require('path');

const codeCommand = async () => {
  const configPath = path.join(process.cwd(), '.oi-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  for (const filePath of config.watch) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.match(/\/\/> (.*?) <\/\//g);

    if (matches) {
      for (const comment of matches) {
        const prompt = comment.replace(/\/\/> /, '').replace(/ <\/\//, '');
        const generatedCode = await generateCode(prompt);

        if (generatedCode) {
          const updatedContent = content.replace(comment, generatedCode);
          fs.writeFileSync(filePath, updatedContent);
          console.log(`Updated file: ${filePath}`);
        }
      }
    }
  }
};

module.exports = {codeCommand};