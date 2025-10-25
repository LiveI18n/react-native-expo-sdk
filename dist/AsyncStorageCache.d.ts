/**
 * Hybrid cache that combines fast in-memory LRU cache with AsyncStorage persistence
 * Optimized for Expo applications that may not have MMKV available
 */
export declare class AsyncStorageCache {
    private memoryCache;
    private asyncStorage;
    private ttl;
    private storagePrefix;
    constructor(maxMemorySize?: number, ttlHours?: number);
    /**
     * Reusable eviction handler to keep AsyncStorage in sync with memory cache
     */
    private onEvict;
    get(key: string): string | undefined;
    /**
     * Background method to load from AsyncStorage and populate memory cache
     */
    private loadFromAsyncStorage;
    set(key: string, value: string): void;
    /**
     * Background method to save to AsyncStorage
     */
    private saveToAsyncStorage;
    /**
     * Background method to remove from AsyncStorage
     */
    private removeFromAsyncStorage;
    clear(): void;
    /**
     * Background method to clear AsyncStorage
     */
    private clearAsyncStorage;
    size(): number;
    /**
     * Get statistics about both cache layers
     */
    getCacheStats(): {
        memory: number;
        persistent: boolean;
        asyncStorageAvailable: boolean;
    };
    /**
     * Preload cache from AsyncStorage
     * Call this during app initialization for better performance
     */
    preloadCache(maxItems?: number): Promise<void>;
    /**
     * Get the cache TTL in milliseconds
     */
    getTtl(): number;
}
