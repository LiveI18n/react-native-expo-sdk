"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCacheKey = exports.ExpoLocaleDetector = exports.MemoryLRUCache = exports.AsyncStorageCache = exports.LiveI18n = exports.getDefaultLanguage = exports.updateDefaultLanguage = exports.getLiveI18nInstance = exports.useLiveI18n = exports.initializeLiveI18n = exports.LiveText = void 0;
exports.translate = translate;
// Expo specific components and hooks
var LiveText_1 = require("./LiveText");
Object.defineProperty(exports, "LiveText", { enumerable: true, get: function () { return LiveText_1.LiveText; } });
Object.defineProperty(exports, "initializeLiveI18n", { enumerable: true, get: function () { return LiveText_1.initializeLiveI18n; } });
Object.defineProperty(exports, "useLiveI18n", { enumerable: true, get: function () { return LiveText_1.useLiveI18n; } });
Object.defineProperty(exports, "getLiveI18nInstance", { enumerable: true, get: function () { return LiveText_1.getLiveI18nInstance; } });
Object.defineProperty(exports, "updateDefaultLanguage", { enumerable: true, get: function () { return LiveText_1.updateDefaultLanguage; } });
Object.defineProperty(exports, "getDefaultLanguage", { enumerable: true, get: function () { return LiveText_1.getDefaultLanguage; } });
// Core classes
var LiveI18n_1 = require("./LiveI18n");
Object.defineProperty(exports, "LiveI18n", { enumerable: true, get: function () { return LiveI18n_1.LiveI18n; } });
// Cache implementations
var AsyncStorageCache_1 = require("./AsyncStorageCache");
Object.defineProperty(exports, "AsyncStorageCache", { enumerable: true, get: function () { return AsyncStorageCache_1.AsyncStorageCache; } });
var MemoryLRUCache_1 = require("./MemoryLRUCache");
Object.defineProperty(exports, "MemoryLRUCache", { enumerable: true, get: function () { return MemoryLRUCache_1.MemoryLRUCache; } });
// Locale detection
var ExpoLocaleDetector_1 = require("./ExpoLocaleDetector");
Object.defineProperty(exports, "ExpoLocaleDetector", { enumerable: true, get: function () { return ExpoLocaleDetector_1.ExpoLocaleDetector; } });
// Cache key generation
var cacheKey_1 = require("./cacheKey");
Object.defineProperty(exports, "generateCacheKey", { enumerable: true, get: function () { return cacheKey_1.generateCacheKey; } });
const LiveText_2 = require("./LiveText");
// Direct translate function for convenience
async function translate(text, options) {
    const instance = (0, LiveText_2.getLiveI18nInstance)();
    if (!instance) {
        console.warn('LiveI18n not initialized, returning original text');
        return text;
    }
    return instance.translate(text, options);
}
