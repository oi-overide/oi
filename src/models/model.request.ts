import { ResponseFormatJSONSchema } from 'openai/resources';
import { ChatCompletionMessageParam as OpenAIChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ActivePlatformDetails } from './model.config';

export interface GeneralRequestObject {
  platform: ActivePlatformDetails;
  metadata: OpenAiRequestObject;
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
  response_format: ResponseFormatJSONSchema;
}
