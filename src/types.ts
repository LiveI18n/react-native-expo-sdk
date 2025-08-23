export interface LiveTextOptions {
  tone?: string;
  context?: string;
  language?: string;
}

export interface LiveI18nConfig {
  apiKey: string;
  customerId: string;
  endpoint?: string;
  defaultLanguage?: string;
  cacheAdapter?: CacheAdapter; // Platform-specific cache adapter
}

export interface TranslationResponse {
  translated: string;
  locale: string;
  cached: boolean;
  confidence: number;
}

// Cache adapter interface for platform-specific implementations
export interface CacheAdapter {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  clear(): void;
  size(): number;
}

// Locale detector interface for platform-specific implementations
export interface LocaleDetector {
  detectLocale(): string;
}