import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  ActivePlatformDetails,
  GlobalConfig,
  GlobalPlatformInfo,
  LocalConfig
} from '../models/model.config';

/**
 * The `DirectoryHelper` class is responsible for managing configuration files and directories
 * for the Oi application. It handles the creation, reading, writing, and validation of
 * configuration files (local and global) and provides utility functions to access service details.
 */
class ConfigCommandUtil {
  // File names for configuration
  private static configFileName = 'oi-config.json';
  private static globalConfigFileName = 'oi-global-config.json';

  /**
   * Checks if the specified configuration file (local or global) exists.
   *
   * @param {boolean} global - True if checking the global config, false for local.
   * @returns {boolean} - True if the configuration file exists, false otherwise.
   */
  public configExists(global: boolean = false, localPath?: string): boolean {
    const configPath = this.getConfigFilePath(global, localPath);
    return fs.existsSync(configPath);
  }

  /**
   * Gets the file path for the configuration file (local or global).
   *
   * @param {boolean} global - True if retrieving the global config file path.
   * @returns {string} - The full path to the configuration file.
   */
  public getConfigFilePath(global: boolean = false, localPath?: string): string {
    if (global) {
      return path.join(this.getGlobalConfigDirectory(), ConfigCommandUtil.globalConfigFileName);
    }

    if (localPath) {
      // Return the local config file path from the specified directory
      return path.join(localPath, ConfigCommandUtil.configFileName);
    }
    // Return the local config file path
    return path.join(process.cwd(), ConfigCommandUtil.configFileName);
  }

  /**
   * Checks if the global configuration directory exists.
   *
   * @returns {boolean} - True if the global configuration directory exists, false otherwise.
   */
  public globalConfigDirectoryExists(): boolean {
    const globalDirPath = this.getGlobalConfigDirectory();
    return fs.existsSync(globalDirPath);
  }

  /**
   * Gets the global configuration directory path.
   *
   * @returns {string} - The path to the global configuration directory.
   */
  private getGlobalConfigDirectory(): string {
    return process.platform === 'win32'
      ? path.join(process.env.APPDATA || '', 'oi') // Windows
      : path.join(os.homedir(), '.config', 'oi'); // Linux/macOS
  }

  /**
   * Creates necessary directories if they do not exist.
   */
  public async makeRequiredDirectories(): Promise<void> {
    const configDir = this.getGlobalConfigDirectory();

    // Create the directory if it doesn't exist
    if (!this.configExists(true)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`Created directory: ${configDir}`);
    }
  }

  /**
   * Reads the configuration file data and constructs the appropriate config object.
   *
   * @param {boolean} global - True if reading global config, false for local.
   * @returns {LocalConfig | GlobalConfig | null} - The configuration object or null if not found.
   */
  public readConfigFileData(
    global: boolean = false,
    localPath?: string
  ): LocalConfig | GlobalConfig | null {
    const configPath = this.getConfigFilePath(global, localPath);

    if (!this.configExists(global)) {
      console.error(`Configuration file not found at ${configPath}`);
      return null;
    }

    const data = fs.readFileSync(configPath, 'utf-8');
    try {
      const config = JSON.parse(data);
      return config; // Assumes the config object matches either LocalConfig or GlobalConfig
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error parsing configuration file: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Writes the configuration data to the specified config file (local or global).
   *
   * @param {boolean} global - True if writing to global config, false for local.
   * @param {LocalConfig | GlobalConfig} data - The configuration data to write.
   */
  public writeConfigFileData(
    global: boolean = false,
    data: LocalConfig | GlobalConfig,
    localPath?: string
  ): void {
    const configPath = this.getConfigFilePath(global, localPath);

    // Ensure the directory exists
    this.makeRequiredDirectories();

    try {
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2)); // Pretty print JSON
      console.log(`Configuration saved to ${configPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error writing configuration file: ${error.message}`);
      }
    }
  }

  /**
   * Retrieves the details of the currently active AI service platform.
   * It reads the global configuration file to determine which platform is marked as active.
   * If an active platform is found, it returns an object containing the platform's name and configuration details.
   *
   * @returns {ActivePlatformDetails | null} An object containing the active platform's name and configuration details,
   * or `null` if no platform is marked as active.
   */
  getActiveServiceDetails(isEmbedding: boolean = false): ActivePlatformDetails | null {
    const globalConfig = this.readConfigFileData(true) as GlobalConfig;

    for (const platform in globalConfig) {
      let platformConfig = globalConfig[platform] as GlobalPlatformInfo;
      if (isEmbedding) {
        const platformName = 'openai';
        platformConfig = globalConfig[platformName] as GlobalPlatformInfo;
        const activePlatformDetails: ActivePlatformDetails = {
          platform: platformName,
          platformConfig: platformConfig
        };

        return activePlatformDetails;
      } else {
        if (platformConfig.isActive) {
          const activePlatformDetails: ActivePlatformDetails = {
            platform: platform,
            platformConfig: platformConfig
          };
          return activePlatformDetails;
        }
      }
    }
    return null;
  }
}

export default new ConfigCommandUtil();
