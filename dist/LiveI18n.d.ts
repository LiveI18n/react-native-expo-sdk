import type { LiveI18nConfig, LiveTextOptions, LocaleDetector } from './types';
/**
 * Core LiveI18n translation class for React Native
 * Includes platform-agnostic translation logic with React Native optimizations
 */
export declare class LiveI18n {
    private apiKey;
    private customerId;
    private cache;
    private endpoint;
    private defaultLanguage?;
    private localeDetector?;
    constructor(config: LiveI18nConfig & {
        localeDetector?: LocaleDetector;
    });
    /**
     * Sleep for a given number of milliseconds
     */
    private sleep;
    /**
     * Make a single translation request attempt
     */
    private makeTranslationRequest;
    /**
     * Translate text using the LiveI18n API with retry logic
     * Generates cache key and sends it to backend to eliminate drift
     * Retries up to 5 times with exponential backoff, max 5 seconds total
     */
    translate(text: string, options?: LiveTextOptions, onRetry?: (attempt: number) => void): Promise<string>;
    /**
     * Clear local cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
    };
    /**
     * Update the default language without re-initializing
     */
    updateDefaultLanguage(language?: string): void;
    /**
     * Get the current default language
     */
    getDefaultLanguage(): string | undefined;
    /**
     * Detect locale using platform-specific detector or fallback
     */
    private detectLocale;
}
