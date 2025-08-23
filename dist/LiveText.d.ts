import React from 'react';
import { LiveI18n } from './LiveI18n';
import type { LiveTextOptions, LiveI18nConfig } from './types';
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
        /** Memory cache size (default: 500 for memory-only, 200 for hybrid) */
        memorySize?: number;
        /** Cache TTL in hours (default: 1) */
        ttlHours?: number;
        /** Preload cache on initialization (default: true) */
        preload?: boolean;
    };
}
/**
 * Initialize the global LiveI18n instance for Expo
 * Must be called before using LiveText components
 */
export declare function initializeLiveI18n(config: ExpoLiveI18nConfig): void;
/**
 * Get the global LiveI18n instance
 * Logs error if not initialized instead of throwing
 */
export declare function getLiveI18nInstance(): LiveI18n | null;
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
    getPreferredLocales: () => string[];
    getDetailedLocale: () => any;
    isRTL: () => boolean;
};
/**
 * Update the default language of the global instance
 */
export declare function updateDefaultLanguage(language?: string): void;
/**
 * Get the current default language of the global instance
 */
export declare function getDefaultLanguage(): string | undefined;
