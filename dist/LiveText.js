"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveText = exports.LiveI18nProvider = void 0;
exports.useLiveI18n = useLiveI18n;
const react_1 = __importStar(require("react"));
const LiveI18n_1 = require("./LiveI18n");
const ExpoLocaleDetector_1 = require("./ExpoLocaleDetector");
const AsyncStorageCache_1 = require("./AsyncStorageCache");
const MemoryLRUCache_1 = require("./MemoryLRUCache");
const LiveI18nContext = (0, react_1.createContext)({
    instance: null,
    defaultLanguage: undefined,
    updateDefaultLanguage: () => { }
});
const LiveI18nProvider = ({ config, children }) => {
    const [instance] = (0, react_1.useState)(() => {
        // Create appropriate cache based on configuration
        let cache = undefined;
        if (config.cache) {
            if (config.cache.persistent !== false) {
                // Use AsyncStorage + memory cache by default
                cache = new AsyncStorageCache_1.AsyncStorageCache(config.cache.entrySize || MemoryLRUCache_1.DEFAULT_CACHE_SIZE, config.cache.ttlHours || 1);
                // Preload cache if requested (default: true)
                if (config.cache.preload !== false) {
                    cache.preloadCache().catch(error => {
                        console.warn('LiveI18n: Failed to preload cache:', error);
                    });
                }
            }
            // If persistent is explicitly false, use default memory cache from core
        }
        else {
            // Default to persistent cache (no preload unless explicitly configured)
            cache = new AsyncStorageCache_1.AsyncStorageCache(MemoryLRUCache_1.DEFAULT_CACHE_SIZE, 1);
        }
        return new LiveI18n_1.LiveI18n({
            ...config,
            cache,
            localeDetector: new ExpoLocaleDetector_1.ExpoLocaleDetector()
        });
    });
    const [defaultLanguage, setDefaultLanguage] = (0, react_1.useState)(instance.getDefaultLanguage());
    const updateDefaultLanguage = (0, react_1.useCallback)((language) => {
        instance.updateDefaultLanguage(language);
        setDefaultLanguage(language);
    }, [instance]);
    const contextValue = (0, react_1.useCallback)(() => ({
        instance,
        defaultLanguage,
        updateDefaultLanguage
    }), [instance, defaultLanguage, updateDefaultLanguage]);
    return (react_1.default.createElement(LiveI18nContext.Provider, { value: contextValue() }, children));
};
exports.LiveI18nProvider = LiveI18nProvider;
/**
 * Extract string content from React.ReactNode
 * Handles strings, numbers, arrays of strings/numbers, and filters out non-text content
 */
function extractStringContent(children) {
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
const LiveText = ({ children, tone, context, language, fallback, onTranslationComplete, onError }) => {
    // Extract string content from children
    const textContent = extractStringContent(children);
    const [translated, setTranslated] = (0, react_1.useState)(textContent);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [attempts, setAttempts] = (0, react_1.useState)(0);
    const contextValue = (0, react_1.useContext)(LiveI18nContext);
    if (!contextValue.instance) {
        throw new Error('LiveText must be used within LiveI18nProvider');
    }
    const instance = contextValue.instance;
    const defaultLanguage = contextValue.defaultLanguage;
    (0, react_1.useEffect)(() => {
        // if we are on a second attempt set loading to false
        // this way we can show the original text and exit the loading animation early
        // while we keep attempting translation in the background
        if (attempts > 0 && isLoading) {
            setIsLoading(false);
        }
    }, [attempts, isLoading]);
    (0, react_1.useEffect)(() => {
        // Don't translate empty strings
        if (!textContent.trim()) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const onRetry = (attempt) => {
            setAttempts(attempt);
        };
        instance
            .translate(textContent, { tone, context, language }, onRetry)
            .then((result) => {
            setTranslated(result);
            onTranslationComplete === null || onTranslationComplete === void 0 ? void 0 : onTranslationComplete(textContent, result);
        })
            .catch((error) => {
            console.error('LiveText translation failed:', error);
            setTranslated(fallback || textContent);
            onError === null || onError === void 0 ? void 0 : onError(error);
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
    return react_1.default.createElement(react_1.default.Fragment, null, translated);
};
exports.LiveText = LiveText;
/**
 * Hook for programmatic translation access with Expo-specific utilities
 * Must be used within LiveI18nProvider
 */
function useLiveI18n() {
    const context = (0, react_1.useContext)(LiveI18nContext);
    if (!context.instance) {
        throw new Error('useLiveI18n must be used within LiveI18nProvider');
    }
    const instance = context.instance; // TypeScript now knows this is not null
    const translate = async (text, options) => {
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
            const detector = new ExpoLocaleDetector_1.ExpoLocaleDetector();
            return detector.getPreferredLocales();
        },
        getDetailedLocale: () => {
            const detector = new ExpoLocaleDetector_1.ExpoLocaleDetector();
            return detector.getDetailedLocale();
        },
        isRTL: () => {
            const detector = new ExpoLocaleDetector_1.ExpoLocaleDetector();
            return detector.isRTL();
        }
    };
}
