import type { LocaleDetector } from './types';

/**
 * Expo-specific locale detection using expo-localization
 * Optimized for Expo managed workflow with built-in Expo capabilities
 */
export class ExpoLocaleDetector implements LocaleDetector {
  detectLocale(): string {
    try {
      // Try to import expo-localization
      const { getLocales } = require('expo-localization');
      
      // Get user's preferred locales
      const locales = getLocales();
      
      if (locales && locales.length > 0) {
        // Return the most preferred locale's language tag
        return locales[0].languageTag || 'en-US';
      }
    } catch (error) {
      console.warn('LiveI18n: expo-localization not available, falling back to en-US');
    }
    
    return 'en-US';
  }
  
  /**
   * Get all user preferred locales in order
   * Uses Expo's built-in localization API
   */
  getPreferredLocales(): string[] {
    try {
      const { getLocales } = require('expo-localization');
      const locales = getLocales();
      
      return locales ? locales.map((locale: any) => locale.languageTag).filter(Boolean) : ['en-US'];
    } catch (error) {
      console.warn('LiveI18n: expo-localization not available');
      return ['en-US'];
    }
  }
  
  /**
   * Get the user's current locale with full information
   * Returns detailed locale information available in Expo
   */
  getDetailedLocale(): any {
    try {
      const { getLocales } = require('expo-localization');
      const locales = getLocales();
      
      return locales && locales.length > 0 ? locales[0] : { languageTag: 'en-US' };
    } catch (error) {
      console.warn('LiveI18n: expo-localization not available');
      return { languageTag: 'en-US' };
    }
  }
  
  /**
   * Check if the user is using a right-to-left language
   * Useful for layout adjustments
   */
  isRTL(): boolean {
    try {
      const locale = this.getDetailedLocale();
      return locale.textDirection === 'rtl';
    } catch (error) {
      return false;
    }
  }
}