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

export interface FileContents {
    [filePath: string]: string;
}
