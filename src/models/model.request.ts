import { ChatCompletionMessageParam as OpenAIChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ChatCompletionMessageParam as GroqChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { ActivePlatformDetails } from './model.config';

export interface GeneralRequestObject {
  platform: ActivePlatformDetails;
  metadata: OpenAiRequestObject | DeepSeekRequestObject | GroqRequestObject;
}

export interface OpenAiRequestObject {
  model: string;
  messages: OpenAIChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
  n?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface DeepSeekRequestObject {
  model: string;
  messages: OpenAIChatCompletionMessageParam[];
}

export interface GroqRequestObject {
  model: string;
  messages: GroqChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}
