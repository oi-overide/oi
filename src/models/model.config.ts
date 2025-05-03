export interface LocalConfig {
  projectName: string;
  embedding: boolean;
  depgraph: boolean;
  ignore: string[];
}

export interface GlobalConfig {
  [platform: string]: GlobalPlatformInfo;
}

export interface GlobalPlatformInfo {
  apiKey?: string;
  orgId?: string;
  isActive: boolean;
}

export interface ActivePlatformDetails {
  platform: string;
  platformConfig: GlobalPlatformInfo;
}

export const supportedPlatforms = ['OpenAI'];

export const platformQuestions = {
  openai: [
    { type: 'input', name: 'apiKey', message: 'Enter your API key:' },
    { type: 'input', name: 'orgId', message: 'Enter your Organization ID:' }
  ]
};
