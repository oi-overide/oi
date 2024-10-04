const fs = require('fs');
const path = require('path');

class Directory {
    // Gather files recursively
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