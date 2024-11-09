import path from 'path';
import { exec } from 'child_process';

abstract class ScriptService {}

class ScriptServiceImpl extends ScriptService {
  winPythonInstallScriptPath = path.resolve(__dirname, '../assets/scripts/win_python_install.ps1');
  macLinPythonInstallScriptPath = path.resolve(
    __dirname,
    '../assets/scripts/mac_lin_python_install.sh'
  );
  winChromaInstallScriptPath = '';
  macLinChromaInstallScriptPath = '';

  private async executeScript(script: string): Promise<void> {
    exec(script, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
      }
      if (stdout !== '') {
        console.log(`Script output:\n${stdout}`);
      }
    });
    return;
  }

  async installPython(): Promise<void> {
    const platform = process.platform;
    console.log('Installing Python3 and pip3');

    if (platform === 'win32') {
      const permissionCommand = `chmod +x ${this.winPythonInstallScriptPath}`;
      this.executeScript(permissionCommand);
      const command = `powershell -ExecutionPolicy Bypass -File ${this.winPythonInstallScriptPath}`;
      this.executeScript(command);
    }

    if (platform === 'darwin' || platform === 'linux') {
      const permissionCommand = `chmod +x ${this.macLinPythonInstallScriptPath}`;
      this.executeScript(permissionCommand);
      const command = `sh ${this.macLinPythonInstallScriptPath}`;
      this.executeScript(command);
    }
  }
}

export default new ScriptServiceImpl();
