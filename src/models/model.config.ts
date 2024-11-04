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

export const supportedPlatforms = ['OpenAI', 'DeepSeek', 'Groq'];

export const supportedLanguages = [
  'cpp',
  'c',
  'java',
  'python',
  'ruby',
  'go',
  'javascript',
  'typescript',
  'csharp'
];

export const platformQuestions = {
  openai: [
    { type: 'input', name: 'apiKey', message: 'Enter your API key:' },
    { type: 'input', name: 'orgId', message: 'Enter your Organization ID:' }
  ],
  deepseek: [
    { type: 'input', name: 'apiKey', message: 'Enter your API key:' },
    { type: 'input', name: 'baseUrl', message: 'Enter the BaseUrl to use:' }
  ],
  groq: [{ type: 'input', name: 'apiKey', message: 'Enter your Groq API key:' }]
};
