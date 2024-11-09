import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

abstract class ScriptService {}

class ScriptServiceImpl extends ScriptService {
  permissionCommand = 'chmod +x';
  macLinChromaInstallScriptPath = path.resolve(__dirname, '../assets/scripts/chroma.sh');
  winChromaInstallScriptPath = path.resolve(__dirname, '../assets/scripts/chroma.ps1'); // Assuming a PowerShell script for Windows

  private async executeScript(command: string, args: string[]): Promise<void> {
    try {
      // Check platform to determine the appropriate execution method
      const platform = os.platform();

      // If the platform is Windows, we need to adjust the command
      if (platform === 'win32') {
        // Windows requires different handling, we execute the PowerShell script or batch file
        if (command === 'chmod') {
          console.log('Skipping chmod command on Windows.');
        } else {
          const powershellCommand = 'powershell.exe';
          args = ['-ExecutionPolicy', 'Bypass', '-File', command, ...args];
          command = powershellCommand;
        }
      }

      // Spawn a new child process to execute the script
      const process = spawn(command, args, { shell: true });

      // Listen for stdout data
      process.stdout.on('data', data => {
        console.log(data.toString()); // Print standard output
      });

      // Listen for stderr data
      process.stderr.on('data', data => {
        console.error(data.toString()); // Print error output
      });

      // Listen for the process to exit
      process.on('close', code => {
        if (code === 0) {
          console.log('Script executed successfully.');
        } else {
          console.error(`Script execution failed with exit code ${code}.`);
        }
      });

      // Listen for any errors that occur in the spawning process
      process.on('error', err => {
        console.error(`Failed to start script: ${err.message}`);
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error executing script: ${error.message}`);
      }
    }
  }

  async installChromadb(): Promise<void> {
    try {
      // First command: permissionCommand followed by the install script path
      // We skip permissionCommand on Windows
      if (process.platform !== 'win32') {
        await this.executeScript(this.permissionCommand, [this.macLinChromaInstallScriptPath]);
      }

      // Second command: run the install script directly using `sh` for macOS/Linux or `powershell.exe` for Windows
      const command = process.platform === 'win32' ? this.winChromaInstallScriptPath : 'sh';
      const args = process.platform === 'win32' ? [] : [this.macLinChromaInstallScriptPath];

      await this.executeScript(command, args);
    } catch (e) {
      console.log(
        'Please make sure pip is installed.\n You can also run `pip install chromadb` or  `pip3 install chromadb`. Make sure the command -> chroma is available globally.'
      );
      console.error(e); // Log the actual error for debugging purposes
    }
  }
}

export default new ScriptServiceImpl();
