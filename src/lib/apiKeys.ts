export interface ApiKeys {
  openai: string;
  anthropic: string;
  elevenlabs: string;
  replicate: string;
  deepgram: string;
  wavespeed: string;
}

export type LlmProvider = 'openai' | 'anthropic';

export const DEFAULT_API_KEYS: ApiKeys = {
  openai: '',
  anthropic: '',
  elevenlabs: '',
  replicate: '',
  deepgram: '',
  wavespeed: '',
};

const API_KEYS_STORAGE_KEY = 'vibecut-api-keys';
const LLM_PROVIDER_STORAGE_KEY = 'vibecut-llm-provider';

const API_KEY_FIELDS = Object.keys(DEFAULT_API_KEYS) as (keyof ApiKeys)[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function parseApiKeys(raw: string | null): ApiKeys {
  if (!raw) return { ...DEFAULT_API_KEYS };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { ...DEFAULT_API_KEYS };

    return API_KEY_FIELDS.reduce<ApiKeys>((keys, field) => {
      const value = parsed[field];
      keys[field] = typeof value === 'string' ? value.trim() : '';
      return keys;
    }, { ...DEFAULT_API_KEYS });
  } catch (error) {
    console.warn('Failed to parse stored VibeCut API keys:', error);
    return { ...DEFAULT_API_KEYS };
  }
}

export function loadApiKeys(): ApiKeys {
  if (typeof window === 'undefined') return { ...DEFAULT_API_KEYS };
  return parseApiKeys(window.localStorage.getItem(API_KEYS_STORAGE_KEY));
}

export function saveApiKeys(keys: ApiKeys) {
  window.localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export function loadLlmProvider(): LlmProvider {
  if (typeof window === 'undefined') return 'anthropic';
  const provider = window.localStorage.getItem(LLM_PROVIDER_STORAGE_KEY);
  return provider === 'openai' || provider === 'anthropic' ? provider : 'anthropic';
}

export function saveLlmProvider(provider: LlmProvider) {
  window.localStorage.setItem(LLM_PROVIDER_STORAGE_KEY, provider);
}
