import { MemoryLRUCache } from './MemoryLRUCache';
import { AsyncStorageCache } from './AsyncStorageCache';
import { type LoadingPattern } from './loadingIndicator';
import type { LiveI18nConfig, LiveTextOptions, LocaleDetector, SupportedLanguagesResponse } from './types';
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
    private debug;
    private batchRequests;
    private loadingPattern;
    private localeDetector?;
    private translationQueue;
    private queueTimer;
    private supportedLanguagesCache;
    constructor(config: LiveI18nConfig & {
        localeDetector?: LocaleDetector;
        cache?: MemoryLRUCache | AsyncStorageCache;
    });
    /**
     * Sleep for a given number of milliseconds
     */
    private sleep;
    private debugLog;
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
     * Make individual translation (existing logic moved here)
     */
    private makeIndividualTranslation;
    /**
     * Add translation request to batch queue
     */
    private addToQueue;
    /**
     * Flush the translation queue
     */
    private flushQueue;
    /**
     * Make batch translation request with retry logic
     * Never throws - always returns results array (original text for failures)
     */
    private translateBatchWithRetry;
    /**
     * Make batch translation request to API
     */
    private translateBatch;
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
     * Get the current loading pattern configuration
     */
    getLoadingPattern(): LoadingPattern;
    /**
     * Get supported languages from the API
     * @param all - If true, returns all supported languages. If false/undefined, returns top 20
     * @returns Promise resolving to supported languages response
     */
    getSupportedLanguages(all?: boolean): Promise<SupportedLanguagesResponse>;
    /**
     * Detect locale using platform-specific detector or fallback
     */
    private detectLocale;
}
