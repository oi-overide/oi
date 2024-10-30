import FormatPrompt from './format.prompt';
import CommandHelper from '../helpers/help.commands';
import { GlobalConfig, ActivePlatformDetails, PlatformConfig } from '../../interfaces/interfaces';

/**
 * The `FormatRequest` class is responsible for creating a dynamic request 
 * based on the active AI service platform (OpenAI or DeepSeek). It formats 
 * the prompt using `FormatPrompt` and constructs the request body accordingly.
 */
class FormatRequest {
    /**
     * Creates a dynamic request object based on the active service platform.
     * It calls either the OpenAI or DeepSeek-specific request formatting function.
     * 
     * @param prompt - The raw prompt extracted from the file.
     * @param promptArray - The array of context around the prompt.
     * @param completionType - The type of completion being requested.
     * @param verbose - Whether to log the request creation process.
     * @returns The formatted request object for the active service.
     */
    async createRequest(prompt: string, promptArray: string[], completionType: string, verbose = false): Promise<object | void> {
        try {
            // Fetch details about the active AI service (platform, API key, etc.)
            const activeServiceDetails = await this.getActiveServiceDetails();

            if(activeServiceDetails === null) {
                throw new Error("No active service found.");
            }

            // Determine which platform is active and create the appropriate request
            switch (activeServiceDetails.platform) {
                case 'openai':
                    return this.createOpenAIRequest(prompt, promptArray, activeServiceDetails.platformConfig, completionType, verbose);

                case 'deepseek':
                    return this.createDeepSeekRequest(prompt, promptArray, activeServiceDetails.platformConfig, completionType);

                case 'groq':
                    return this.createGroqRequest(prompt, promptArray, activeServiceDetails.platformConfig, completionType, verbose);

                default:
                    throw new Error(`Unsupported platform: ${activeServiceDetails.platform}`);
            }
        } catch (error: any) {
            console.error(`Error in creating request: ${error.message}`);
        }
    }

    /**
     * Creates and formats the request for OpenAI models.
     * 
     * @param prompt - The raw prompt extracted from the file.
     * @param promptArray - The array of context around the prompt.
     * @param activeServiceDetails - Details about the active service (platform, apiKey, etc.).
     * @param completionType - The type of completion being requested.
     * @param verbose - Whether to log the request details.
     * @returns The request object for the OpenAI API.
     */
    async createOpenAIRequest(
        prompt: string,
        promptArray: string[],
        activeServiceDetails: PlatformConfig,
        completionType: string,
        verbose: boolean
    ): Promise<object> {
        const finalPrompt = await FormatPrompt.getOpenAiPrompt(promptArray, prompt, completionType);

        if (verbose) {
            console.log(`Prompt Text : ${finalPrompt}`);
        }

        // Construct the request body for OpenAI API
        return {
            activeServiceDetails,
            metadata: {
                model: "gpt-4o", // Specify the model to use
                messages: [
                    { role: 'system', content: 'You are a coding assistant api.' },
                    { role: 'user', content: finalPrompt },
                ],
                temperature: 0.7, // Adjust temperature for creativity (lower = more deterministic)
                max_tokens: 1000, // Max tokens for the response
                n: 1, // Number of completions to generate
                stream: false, // Whether to stream results
                presence_penalty: 0, // Adjusts frequency of introducing new ideas
                frequency_penalty: 0, // Adjusts repetition
            },
        };
    }

    /**
     * Creates and formats the request for DeepSeek models.
     * 
     * @param prompt - The raw prompt extracted from the file.
     * @param promptArray - The array of context around the prompt.
     * @param activeServiceDetails - Details about the active service (platform, apiKey, etc.).
     * @param completionType - The type of completion being requested.
     * @returns The request object for the DeepSeek API.
     */
    async createDeepSeekRequest(
        prompt: string,
        promptArray: string[],
        activeServiceDetails: PlatformConfig,
        completionType: string
    ): Promise<object | void> {
        try {
            const finalPrompt = await FormatPrompt.getDeepSeekPrompt(promptArray, prompt, completionType);
            const messages = [{ role: "system", content: finalPrompt }, { role: "user", content: prompt }];

            // Construct the request body for DeepSeek API
            return {
                activeServiceDetails,
                metadata: {
                    messages: messages,
                    model: "deepseek-chat",
                }
            };
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Creates and formats the request for Groq models.
     * 
     * @param prompt - The raw prompt extracted from the file.
     * @param promptArray - The array of context around the prompt.
     * @param activeServiceDetails - Details about the active service (platform, apiKey, etc.).
     * @param completionType - The type of completion being requested.
     * @param verbose - Whether to log the request details.
     * @returns The request object for the Groq API.
     */
    async createGroqRequest(
        prompt: string,
        promptArray: string[],
        activeServiceDetails: PlatformConfig,
        completionType: string,
        verbose: boolean
    ): Promise<object> {
        const finalPrompt = await FormatPrompt.getGroqPrompt(promptArray, prompt, completionType);

        if (verbose) {
            console.log(`Prompt Text : ${finalPrompt}`);
        }

        return {
            activeServiceDetails,
            metadata: {
                model: "llama-3.1-70b-versatile",
                messages: [
                    { role: 'system', content: 'You are a coding assistant api.' },
                    { role: 'user', content: finalPrompt },
                ],
                temperature: 0.94,
                max_tokens: 2048,
                top_p: 1,
                stream: false,
                stop: null
            },
        };
    }
    
    /**
     * Retrieves the details of the currently active AI service platform.
     * It reads the global configuration file to determine which platform is marked as active.
     * If an active platform is found, it returns an object containing the platform's name and configuration details.
     * 
     * @returns {ActivePlatformDetails | null} An object containing the active platform's name and configuration details, 
     * or `null` if no platform is marked as active.
     */
    getActiveServiceDetails(): ActivePlatformDetails | null {
        const globalConfig = CommandHelper.readConfigFileData(true) as GlobalConfig;
        for (const platform in globalConfig) {
            const platformConfig = globalConfig[platform];
            if (platformConfig.isActive) {
                const activePlatformDetails: ActivePlatformDetails = {
                    platform: platform,
                    platformConfig: platformConfig
                };
                return activePlatformDetails;
            }
        }
        return null;
    }
}

export default new FormatRequest();
