export declare const DEFAULT_CACHE_SIZE = 500;
/**
 * Memory-based LRU Cache implementation
 * Used as the default cache for React Native platforms
 */
export declare class MemoryLRUCache {
    private cache;
    private maxSize;
    private ttl;
    constructor(maxSize?: number, ttlHours?: number);
    get(key: string): string | undefined;
    set(key: string, value: string, onEvict?: (evictedKey: string) => void): void;
    clear(): void;
    size(): number;
}
