export interface InitializeOption {
    ignore?: string[];
    verbose?: boolean;
    projectName?: string;
}

export interface StartOption {
    verbose?: boolean;
}

export interface ConfigOption {
    projectName?: string;
    ignore?: string[];
    global?: boolean;
    verbose?: boolean;
    setActive?: boolean;
}

export interface GlobalConfig {
    [platform: string]: PlatformConfig;
}

export interface LocalConfig {
    projectName: string;
    ignore: string[];
}

export interface PlatformConfig {
    apiKey?: string; // Optional, as Ollama does not require an API key
    baseUrl?: string; // Optional, as not all platforms may have a baseUrl
    orgId?: string;   // Optional, specific to platforms like OpenAI
    isActive: boolean;
}

export interface ActivePlatformDetails {
    platform: string;
    platformConfig: PlatformConfig;
}

export interface FileContents {
    [filePath: string]: string;
}


/**
 * Type representing a block of code replacement.
 */
export interface ReplacementBlock {
    find: string[];              // The code to find in the file.
    replace: string[];         // The replacement code.
}

export interface PromptInfo {
    [platform: string]: PlatformPromptInfo    
}

export interface PlatformPromptInfo {
    systemMessage: string;
    complete: {
        format: string;
        instructions: string[];
    };
    update: {
        context: string;
        format: string;
        instructions: string[];
    };
}
