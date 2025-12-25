import { createOpenAI } from '@ai-sdk/openai';

export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const getModel = (): string => {
  return process.env.OPENROUTER_MODEL || 'mistralai/devstral-2512:free';
};

