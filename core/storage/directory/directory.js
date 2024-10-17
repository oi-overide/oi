const fs = require('fs');
const path = require('path');

class Directory {
    removeAcceptanceMessage = (fileContent, filePath, acceptanceLine) => {
        try {
            if (fileContent.includes(acceptanceLine)) {
                const updatedContent = fileContent.replace(`${acceptanceLine}`, '');
                fs.writeFileSync(filePath, updatedContent, 'utf-8');
                console.log('Acceptance message removed successfully');
            } else {
                console.log('Acceptance message not found in file path');
            }
        } catch (e) {
            console.log('Acceptance message not found in file path', e);
        }
    }

    removeCodeBlock = (fileContent, filePath, codeBlock) => {
        try {
            if (fileContent.includes(codeBlock)) {
                const updatedContent = fileContent.replace(`${codeBlock}`, '');
                console.log(codeBlock);
                fs.writeFileSync(filePath, updatedContent, 'utf-8');
                console.log('Code block inserted successfully');
            } else {
                console.log('Prompt not found in file path');
            }
        } catch (e) {
            console.log('Prompt not found in file path', e);
        }
    }

    insertCodeBlock = (filePath, prompt, newCode) => {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            if (fileContent.includes(prompt)) {
                const promptContent = prompt.replace('//>', '').replace('<//', '').trim()
                const codeBlock = `
                    //-${promptContent}
                    ${newCode}
                    //> Accept the changes (y/n): -//
                `;
                const updatedContent = fileContent.replace(prompt, codeBlock);
                fs.writeFileSync(filePath, updatedContent, 'utf-8');
                console.log('Code block inserted successfully');
            } else {
                console.log('Prompt not found in file path');
            }
        } catch (e) {
            console.log('Prompt not found in file path', e);
        }
    }

    // Gather files recursively for generating the dependency graph.
    gatherFilesRecursively = (dirPath, fileContents, ignoreList = [], verbose = false) => {
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
                this.gatherFilesRecursively(filePath, fileContents, ignoreList, verbose);
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
}

module.exports = new Directory();