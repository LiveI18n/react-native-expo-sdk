// Expo specific components and hooks
export { 
  LiveText, 
  initializeLiveI18n, 
  useLiveI18n, 
  getLiveI18nInstance, 
  updateDefaultLanguage, 
  getDefaultLanguage 
} from './LiveText';

// Expo specific types
export type { ExpoLiveI18nConfig } from './LiveText';

// Core classes
export { LiveI18n } from './LiveI18n';

// Cache implementations
export { AsyncStorageCache } from './AsyncStorageCache';
export { MemoryLRUCache } from './MemoryLRUCache';

// Locale detection
export { ExpoLocaleDetector } from './ExpoLocaleDetector';

// Core types for convenience
export type { LiveTextOptions, LiveI18nConfig, LocaleDetector, TranslationResponse } from './types';

// Cache key generation
export { generateCacheKey } from './cacheKey';

import { getLiveI18nInstance } from './LiveText';
import type { LiveTextOptions } from './types';

// Direct translate function for convenience
export async function translate(text: string, options?: LiveTextOptions): Promise<string> {
  const instance = getLiveI18nInstance();
  if (!instance) {
    console.warn('LiveI18n not initialized, returning original text');
    return text;
  }
  return instance.translate(text, options);
}