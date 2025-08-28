import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { LiveI18n } from './LiveI18n';
import type { LiveTextOptions, LiveI18nConfig } from './types';
import { ExpoLocaleDetector } from './ExpoLocaleDetector';
import { AsyncStorageCache } from './AsyncStorageCache';
import { DEFAULT_CACHE_SIZE } from './MemoryLRUCache';

// React Context for LiveI18n
interface LiveI18nContextValue {
  instance: LiveI18n | null;
  defaultLanguage: string | undefined;
  updateDefaultLanguage: (language?: string) => void;
}

const LiveI18nContext = createContext<LiveI18nContextValue>({
  instance: null,
  defaultLanguage: undefined,
  updateDefaultLanguage: () => {}
});

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

export const LiveI18nProvider: React.FC<LiveI18nProviderProps> = ({ config, children }) => {
  const [instance] = useState<LiveI18n>(() => {
    // Create appropriate cache based on configuration
    let cache: AsyncStorageCache | undefined = undefined;
    
    if (config.cache) {
      if (config.cache.persistent !== false) {
        // Use AsyncStorage + memory cache by default
        cache = new AsyncStorageCache(
          config.cache.entrySize || DEFAULT_CACHE_SIZE,
          config.cache.ttlHours || 1
        );
        
        // Preload cache if requested (default: true)
        if (config.cache.preload !== false) {
          cache.preloadCache().catch(error => {
            console.warn('LiveI18n: Failed to preload cache:', error);
          });
        }
      }
      // If persistent is explicitly false, use default memory cache from core
    } else {
      // Default to persistent cache (no preload unless explicitly configured)
      cache = new AsyncStorageCache(DEFAULT_CACHE_SIZE, 1);
    }

    return new LiveI18n({
      ...config,
      cache,
      localeDetector: new ExpoLocaleDetector()
    });
  });
  
  const [defaultLanguage, setDefaultLanguage] = useState<string | undefined>(
    instance.getDefaultLanguage()
  );

  const updateDefaultLanguage = useCallback((language?: string) => {
    instance.updateDefaultLanguage(language);
    setDefaultLanguage(language);
  }, [instance]);

  const contextValue = useCallback(() => ({
    instance,
    defaultLanguage,
    updateDefaultLanguage
  }), [instance, defaultLanguage, updateDefaultLanguage]);

  return (
    <LiveI18nContext.Provider value={contextValue()}>
      {children}
    </LiveI18nContext.Provider>
  );
};

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
  
  const contextValue = useContext(LiveI18nContext);
  
  if (!contextValue.instance) {
    throw new Error('LiveText must be used within LiveI18nProvider');
  }

  const instance = contextValue.instance;
  const defaultLanguage = contextValue.defaultLanguage;

  useEffect(() => {
    // if we are on a second attempt set loading to false
    // this way we can show the original text and exit the loading animation early
    // while we keep attempting translation in the background
    if (attempts > 0 && isLoading) {
      setIsLoading(false);
    }
  }, [attempts, isLoading]);

  useEffect(() => {
    // Don't translate empty strings
    if (!textContent.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const onRetry = (attempt: number) => {
      setAttempts(attempt);
    };

    instance
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
  }, [
    textContent, 
    tone, 
    context, 
    language, 
    defaultLanguage, 
    fallback, 
    onTranslationComplete, 
    onError, 
    instance
  ]);

  return <>{translated}</>;
};

/**
 * Hook for programmatic translation access with Expo-specific utilities
 * Must be used within LiveI18nProvider
 */
export function useLiveI18n() {
  const context = useContext(LiveI18nContext);
  
  if (!context.instance) {
    throw new Error('useLiveI18n must be used within LiveI18nProvider');
  }

  const instance = context.instance; // TypeScript now knows this is not null

  const translate = async (text: string, options?: LiveTextOptions): Promise<string> => {
    return instance.translate(text, options);
  };

  return {
    translate,
    defaultLanguage: context.defaultLanguage,
    clearCache: () => instance.clearCache(),
    getCacheStats: () => instance.getCacheStats() || { size: 0, maxSize: 0 },
    updateDefaultLanguage: context.updateDefaultLanguage,
    getDefaultLanguage: () => instance.getDefaultLanguage(),
    // Expo specific utilities
    getPreferredLocales: () => {
      const detector = new ExpoLocaleDetector();
      return detector.getPreferredLocales();
    },
    getDetailedLocale: () => {
      const detector = new ExpoLocaleDetector();
      return detector.getDetailedLocale();
    },
    isRTL: () => {
      const detector = new ExpoLocaleDetector();
      return detector.isRTL();
    }
  };
}

