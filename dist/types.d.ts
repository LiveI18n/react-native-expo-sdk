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
    debug?: boolean;
    batch_requests?: boolean;
    loading?: {
        /** Loading indicator pattern: 'dots', 'blocks', or 'none' (default: 'none') */
        pattern?: 'dots' | 'blocks' | 'none';
    };
}
export interface TranslationResponse {
    translated: string;
    locale: string;
    cached: boolean;
    confidence: number;
}
export interface LocaleDetector {
    detectLocale(): string;
}
export interface QueuedTranslation {
    text: string;
    options?: LiveTextOptions;
    cacheKey: string;
    resolve: (result: string) => void;
    reject: (error: Error) => void;
}
export interface BatchTranslationRequest {
    text: string;
    locale: string;
    tone: string;
    context: string;
    cache_key: string;
}
export interface BatchTranslationResponse {
    responses: Array<{
        cache_key: string;
        translated: string;
        confidence: number;
        cached?: boolean;
        error?: string;
    }>;
}
export interface SupportedLanguage {
    name: string;
    locale: string;
    flag: string;
}
export interface SupportedLanguagesResponse {
    languages: SupportedLanguage[];
    total: number;
}
