"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncStorageCache = void 0;
const MemoryLRUCache_1 = require("./MemoryLRUCache");
/**
 * Hybrid cache that combines fast in-memory LRU cache with AsyncStorage persistence
 * Optimized for Expo applications that may not have MMKV available
 */
class AsyncStorageCache {
    constructor(maxMemorySize = MemoryLRUCache_1.DEFAULT_CACHE_SIZE, ttlHours = 1) {
        this.storagePrefix = 'livei18n_cache_';
        /**
         * Reusable eviction handler to keep AsyncStorage in sync with memory cache
         */
        this.onEvict = (evictedKey) => {
            this.removeFromAsyncStorage(evictedKey);
        };
        this.ttl = ttlHours * 60 * 60 * 1000; // Convert to milliseconds
        this.memoryCache = new MemoryLRUCache_1.MemoryLRUCache(maxMemorySize, ttlHours);
        try {
            // Try to import AsyncStorage
            this.asyncStorage = require('@react-native-async-storage/async-storage').default;
            console.log('LiveI18n: AsyncStorage persistent cache initialized');
        }
        catch (error) {
            console.warn('LiveI18n: AsyncStorage not available, falling back to memory-only cache');
            this.asyncStorage = null;
        }
    }
    get(key) {
        // First, try memory cache (fastest)
        const memoryResult = this.memoryCache.get(key);
        if (memoryResult) {
            return memoryResult;
        }
        // AsyncStorage is async, so we can't wait here
        // Instead, we'll return undefined and let the background loading happen
        this.loadFromAsyncStorage(key);
        return undefined;
    }
    /**
     * Background method to load from AsyncStorage and populate memory cache
     */
    async loadFromAsyncStorage(key) {
        if (!this.asyncStorage)
            return;
        try {
            const persistentData = await this.asyncStorage.getItem(this.storagePrefix + key);
            if (persistentData) {
                const item = JSON.parse(persistentData);
                // Check if item has expired
                if (Date.now() - item.timestamp > this.ttl) {
                    await this.asyncStorage.removeItem(this.storagePrefix + key);
                    return;
                }
                // Put in memory cache for faster future access
                this.memoryCache.set(key, item.value, this.onEvict);
            }
        }
        catch (error) {
            console.warn('LiveI18n: Error reading from AsyncStorage cache:', error);
        }
    }
    set(key, value) {
        // Store in memory cache with eviction callback to keep AsyncStorage in sync
        this.memoryCache.set(key, value, this.onEvict);
        // Also store in AsyncStorage for persistence (fire and forget)
        this.saveToAsyncStorage(key, value);
    }
    /**
     * Background method to save to AsyncStorage
     */
    async saveToAsyncStorage(key, value) {
        if (!this.asyncStorage)
            return;
        try {
            const item = {
                value,
                timestamp: Date.now()
            };
            await this.asyncStorage.setItem(this.storagePrefix + key, JSON.stringify(item));
        }
        catch (error) {
            console.warn('LiveI18n: Error writing to AsyncStorage cache:', error);
        }
    }
    /**
     * Background method to remove from AsyncStorage
     */
    async removeFromAsyncStorage(key) {
        if (!this.asyncStorage)
            return;
        try {
            await this.asyncStorage.removeItem(this.storagePrefix + key);
        }
        catch (error) {
            console.warn('LiveI18n: Error removing from AsyncStorage cache:', error);
        }
    }
    clear() {
        // Clear memory cache
        this.memoryCache.clear();
        // Clear AsyncStorage (fire and forget)
        this.clearAsyncStorage();
    }
    /**
     * Background method to clear AsyncStorage
     */
    async clearAsyncStorage() {
        if (!this.asyncStorage)
            return;
        try {
            const keys = await this.asyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith(this.storagePrefix));
            if (cacheKeys.length > 0) {
                await this.asyncStorage.multiRemove(cacheKeys);
            }
        }
        catch (error) {
            console.warn('LiveI18n: Error clearing AsyncStorage cache:', error);
        }
    }
    size() {
        // Return memory cache size (AsyncStorage doesn't provide easy size calculation)
        return this.memoryCache.size();
    }
    /**
     * Get statistics about both cache layers
     */
    getCacheStats() {
        return {
            memory: this.memoryCache.size(),
            persistent: this.asyncStorage !== null,
            asyncStorageAvailable: this.asyncStorage !== null
        };
    }
    /**
     * Preload cache from AsyncStorage
     * Call this during app initialization for better performance
     */
    async preloadCache(maxItems = 50) {
        if (!this.asyncStorage)
            return;
        try {
            const keys = await this.asyncStorage.getAllKeys();
            const cacheKeys = keys
                .filter((key) => key.startsWith(this.storagePrefix))
                .slice(0, maxItems); // Limit to prevent memory issues
            if (cacheKeys.length > 0) {
                const items = await this.asyncStorage.multiGet(cacheKeys);
                const now = Date.now();
                let loaded = 0;
                for (const [fullKey, data] of items) {
                    if (data) {
                        try {
                            const item = JSON.parse(data);
                            const key = fullKey.replace(this.storagePrefix, '');
                            // Check if item has expired
                            if (now - item.timestamp <= this.ttl) {
                                this.memoryCache.set(key, item.value, this.onEvict);
                                loaded++;
                            }
                            else {
                                // Remove expired item
                                await this.asyncStorage.removeItem(fullKey);
                            }
                        }
                        catch (error) {
                            // Invalid data, remove it
                            await this.asyncStorage.removeItem(fullKey);
                        }
                    }
                }
                if (loaded > 0) {
                    console.log(`LiveI18n: Preloaded ${loaded} cache entries from AsyncStorage`);
                }
            }
        }
        catch (error) {
            console.warn('LiveI18n: Error preloading cache from AsyncStorage:', error);
        }
    }
    /**
     * Get the cache TTL in milliseconds
     */
    getTtl() {
        return this.ttl;
    }
}
exports.AsyncStorageCache = AsyncStorageCache;
