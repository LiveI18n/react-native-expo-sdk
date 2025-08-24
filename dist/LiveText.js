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
exports.LiveText = void 0;
exports.initializeLiveI18n = initializeLiveI18n;
exports.getLiveI18nInstance = getLiveI18nInstance;
exports.useLiveI18n = useLiveI18n;
exports.updateDefaultLanguage = updateDefaultLanguage;
exports.getDefaultLanguage = getDefaultLanguage;
const react_1 = __importStar(require("react"));
const LiveI18n_1 = require("./LiveI18n");
const ExpoLocaleDetector_1 = require("./ExpoLocaleDetector");
const AsyncStorageCache_1 = require("./AsyncStorageCache");
const MemoryLRUCache_1 = require("./MemoryLRUCache");
// Global instance
let globalInstance = null;
/**
 * Initialize the global LiveI18n instance for Expo
 * Must be called before using LiveText components
 */
function initializeLiveI18n(config) {
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
    globalInstance = new LiveI18n_1.LiveI18n({
        ...config,
        cache,
        localeDetector: new ExpoLocaleDetector_1.ExpoLocaleDetector()
    });
}
/**
 * Get the global LiveI18n instance
 * Logs error if not initialized instead of throwing
 */
function getLiveI18nInstance() {
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
    (0, react_1.useEffect)(() => {
        // if we are on a second attempt set loading to false
        // this way we can show the original text and exit the loading animation early
        // while we keep attempting translation in the background
        if (attempts > 0 && isLoading) {
            setIsLoading(false);
        }
    }, [attempts, isLoading]);
    (0, react_1.useEffect)(() => {
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
        const onRetry = (attempt) => {
            setAttempts(attempt);
        };
        globalInstance
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
    }, [textContent, tone, context, language, fallback, onTranslationComplete, onError]);
    return react_1.default.createElement(react_1.default.Fragment, null, translated);
};
exports.LiveText = LiveText;
/**
 * Hook for programmatic translation access with Expo-specific utilities
 */
function useLiveI18n() {
    const instance = getLiveI18nInstance();
    const translate = async (text, options) => {
        if (!instance) {
            console.warn('LiveI18n not initialized, returning original text');
            return text;
        }
        return instance.translate(text, options);
    };
    return {
        translate,
        defaultLanguage: instance === null || instance === void 0 ? void 0 : instance.getDefaultLanguage(),
        clearCache: () => instance === null || instance === void 0 ? void 0 : instance.clearCache(),
        getCacheStats: () => (instance === null || instance === void 0 ? void 0 : instance.getCacheStats()) || { size: 0, maxSize: 0 },
        updateDefaultLanguage: (language) => instance === null || instance === void 0 ? void 0 : instance.updateDefaultLanguage(language),
        getDefaultLanguage: () => instance === null || instance === void 0 ? void 0 : instance.getDefaultLanguage(),
        // Expo specific utilities
        getPreferredLocales: () => {
            if (globalInstance) {
                const detector = new ExpoLocaleDetector_1.ExpoLocaleDetector();
                return detector.getPreferredLocales();
            }
            return ['en-US'];
        },
        getDetailedLocale: () => {
            if (globalInstance) {
                const detector = new ExpoLocaleDetector_1.ExpoLocaleDetector();
                return detector.getDetailedLocale();
            }
            return { languageTag: 'en-US' };
        },
        isRTL: () => {
            if (globalInstance) {
                const detector = new ExpoLocaleDetector_1.ExpoLocaleDetector();
                return detector.isRTL();
            }
            return false;
        }
    };
}
/**
 * Update the default language of the global instance
 */
function updateDefaultLanguage(language) {
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
function getDefaultLanguage() {
    const instance = getLiveI18nInstance();
    if (!instance) {
        console.warn('LiveI18n not initialized, cannot get default language');
        return undefined;
    }
    return instance.getDefaultLanguage();
}
