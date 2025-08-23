import type { LocaleDetector } from './types';
/**
 * Expo-specific locale detection using expo-localization
 * Optimized for Expo managed workflow with built-in Expo capabilities
 */
export declare class ExpoLocaleDetector implements LocaleDetector {
    detectLocale(): string;
    /**
     * Get all user preferred locales in order
     * Uses Expo's built-in localization API
     */
    getPreferredLocales(): string[];
    /**
     * Get the user's current locale with full information
     * Returns detailed locale information available in Expo
     */
    getDetailedLocale(): any;
    /**
     * Check if the user is using a right-to-left language
     * Useful for layout adjustments
     */
    isRTL(): boolean;
}
