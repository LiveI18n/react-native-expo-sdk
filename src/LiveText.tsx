import React, { useEffect, useState } from 'react';
import { LiveI18n } from './LiveI18n';
import type { LiveTextOptions, LiveI18nConfig, CacheAdapter } from './types';
import { ExpoLocaleDetector } from './ExpoLocaleDetector';
import { AsyncStorageCache } from './AsyncStorageCache';

// Global instance
let globalInstance: LiveI18n | null = null;

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
export function initializeLiveI18n(config: ExpoLiveI18nConfig): void {
  // Create appropriate cache adapter based on configuration
  let cacheAdapter: CacheAdapter | undefined = config.cacheAdapter;
  
  if (!cacheAdapter && config.cache) {
    if (config.cache.persistent !== false) {
      // Use AsyncStorage + memory cache by default
      const asyncCache = new AsyncStorageCache(
        config.cache.memorySize || 200,
        config.cache.ttlHours || 1
      );
      
      // Preload cache if requested (default: true)
      if (config.cache.preload !== false) {
        asyncCache.preloadCache().catch(error => {
          console.warn('LiveI18n: Failed to preload cache:', error);
        });
      }
      
      cacheAdapter = asyncCache;
    }
    // If persistent is explicitly false, use default memory cache from core
  }

  globalInstance = new LiveI18n({
    ...config,
    cacheAdapter,
    localeDetector: new ExpoLocaleDetector()
  });
}

/**
 * Get the global LiveI18n instance
 * Logs error if not initialized instead of throwing
 */
export function getLiveI18nInstance(): LiveI18n | null {
  if (!globalInstance) {
    console.error('LiveI18n not initialized. Call initializeLiveI18n() first.');
    return null;
  }
  return globalInstance;
}

/**
 * Extract string content from React.ReactNode
 * Handles strings, numbers, arrays of strings/numbers, and filters out non-text content
 */
function extractStringContent(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (typeof children === 'number') {
    return children.toString();
  }
  
  if (Array.isArray(children)) {
    return children
      .filter(child => typeof child === 'string' || typeof child === 'number')
      .map(child => typeof child === 'number' ? child.toString() : child)
      .join('');
  }
  
  // For other ReactNode types, try to convert to string but warn about potential issues
  if (children != null && typeof children === 'object') {
    console.warn('LiveText: Non-string React elements detected. Only string content will be translated.');
    return String(children);
  }
  
  return String(children || '');
}

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

export const LiveText: React.FC<LiveTextProps> = ({
  children,
  tone,
  context,
  language,
  fallback,
  onTranslationComplete,
  onError
}) => {
  // Extract string content from children
  const textContent = extractStringContent(children);
  
  const [translated, setTranslated] = useState(textContent);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // if we are on a second attempt set loading to false
    // this way we can show the original text and exit the loading animation early
    // while we keep attempting translation in the background
    if (attempts > 0 && isLoading) {
      setIsLoading(false);
    }
  }, [attempts, isLoading]);

  useEffect(() => {
    if (!globalInstance) {
      setIsLoading(false);
      console.error('LiveI18n not initialized. Call initializeLiveI18n() first.');
      return;
    }

    // Don't translate empty strings
    if (!textContent.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const onRetry = (attempt: number) => {
      setAttempts(attempt);
    };

    globalInstance
      .translate(textContent, { tone, context, language }, onRetry)
      .then((result) => {
        setTranslated(result);
        onTranslationComplete?.(textContent, result);
      })
      .catch((error) => {
        console.error('LiveText translation failed:', error);
        setTranslated(fallback || textContent);
        onError?.(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [textContent, tone, context, language, fallback, onTranslationComplete, onError]);

  return <>{translated}</>;
};

/**
 * Hook for programmatic translation access with Expo-specific utilities
 */
export function useLiveI18n() {
  const instance = getLiveI18nInstance();

  const translate = async (text: string, options?: LiveTextOptions): Promise<string> => {
    if (!instance) {
      console.warn('LiveI18n not initialized, returning original text');
      return text;
    }
    return instance.translate(text, options);
  };

  return {
    translate,
    defaultLanguage: instance?.getDefaultLanguage(),
    clearCache: () => instance?.clearCache(),
    getCacheStats: () => instance?.getCacheStats() || { size: 0, maxSize: 0 },
    updateDefaultLanguage: (language?: string) => instance?.updateDefaultLanguage(language),
    getDefaultLanguage: () => instance?.getDefaultLanguage(),
    // Expo specific utilities
    getPreferredLocales: () => {
      if (globalInstance) {
        const detector = new ExpoLocaleDetector();
        return detector.getPreferredLocales();
      }
      return ['en-US'];
    },
    getDetailedLocale: () => {
      if (globalInstance) {
        const detector = new ExpoLocaleDetector();
        return detector.getDetailedLocale();
      }
      return { languageTag: 'en-US' };
    },
    isRTL: () => {
      if (globalInstance) {
        const detector = new ExpoLocaleDetector();
        return detector.isRTL();
      }
      return false;
    }
  };
}

/**
 * Update the default language of the global instance
 */
export function updateDefaultLanguage(language?: string): void {
  const instance = getLiveI18nInstance();
  if (!instance) {
    console.warn('LiveI18n not initialized, cannot update default language');
    return;
  }
  instance.updateDefaultLanguage(language);
}

/**
 * Get the current default language of the global instance
 */
export function getDefaultLanguage(): string | undefined {
  const instance = getLiveI18nInstance();
  if (!instance) {
    console.warn('LiveI18n not initialized, cannot get default language');
    return undefined;
  }
  return instance.getDefaultLanguage();
}