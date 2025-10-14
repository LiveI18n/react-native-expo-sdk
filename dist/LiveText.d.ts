import React from 'react';
import { LiveI18n } from './LiveI18n';
import type { LiveTextOptions, LiveI18nConfig } from './types';
interface LiveI18nContextValue {
    instance: LiveI18n | null;
    defaultLanguage: string | undefined;
    updateDefaultLanguage: (language?: string) => void;
}
export declare const LiveI18nContext: React.Context<LiveI18nContextValue>;
/**
 * Enhanced configuration for Expo with cache options
 */
export interface ExpoLiveI18nConfig extends LiveI18nConfig {
    /**
     * Cache configuration options
     */
    cache?: {
        /** Use persistent AsyncStorage cache */
        persistent?: boolean;
        /** Number of cache entries (default: 500) */
        entrySize?: number;
        /** Cache TTL in hours (default: 1) */
        ttlHours?: number;
        /** Preload cache on initialization (default: true) */
        preload?: boolean;
    };
}
/**
 * React Context Provider for LiveI18n
 * Provides a cleaner alternative to the global instance pattern
 */
export interface LiveI18nProviderProps {
    config: ExpoLiveI18nConfig;
    children: React.ReactNode;
}
export declare const LiveI18nProvider: React.FC<LiveI18nProviderProps>;
/**
 * Expo component for automatic text translation
 * Uses React Native Text component with Expo-specific optimizations
 *
 * Usage:
 * <Text style={styles.text}><LiveText tone="formal" context="navigation">Hello World</LiveText></Text>
 * <LiveText>Hello {name}!</LiveText>
 * <Text numberOfLines={2}><LiveText>You have {count} {count === 1 ? 'message' : 'messages'}</LiveText></Text>
 */
export interface LiveTextProps extends LiveTextOptions {
    children: React.ReactNode;
    fallback?: string;
    onTranslationComplete?: (original: string, translated: string) => void;
    onError?: (error: Error) => void;
}
export declare const LiveText: React.FC<LiveTextProps>;
/**
 * Hook for programmatic translation access with Expo-specific utilities
 * Must be used within LiveI18nProvider
 */
export declare function useLiveI18n(): {
    translate: (text: string, options?: LiveTextOptions) => Promise<string>;
    defaultLanguage: string;
    clearCache: () => void;
    getCacheStats: () => {
        size: number;
        maxSize: number;
    };
    updateDefaultLanguage: (language?: string) => void;
    getDefaultLanguage: () => string;
    getSupportedLanguages: (all?: boolean) => Promise<import("./types").SupportedLanguagesResponse>;
    getPreferredLocales: () => string[];
    getDetailedLocale: () => any;
    isRTL: () => boolean;
};
export {};
