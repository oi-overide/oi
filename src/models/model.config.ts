export interface LocalConfig {
  projectName: string;
  ignore: string[];
}

export interface GlobalConfig {
  [platform: string]: GlobalPlatformInfo;
}

export interface GlobalPlatformInfo {
  apiKey?: string; // Optional, as Ollama does not require an API key
  baseUrl?: string; // Optional, as not all platforms may have a baseUrl
  orgId?: string; // Optional, specific to platforms like OpenAI
  isActive: boolean;
}

export interface ActivePlatformDetails {
  platform: string;
  platformConfig: GlobalPlatformInfo;
}
