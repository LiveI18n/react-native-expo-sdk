import type { CacheAdapter } from './types';
/**
 * Memory-based LRU Cache implementation
 * Used as the default cache adapter across all platforms
 */
export declare class MemoryLRUCache implements CacheAdapter {
    private cache;
    private maxSize;
    private ttl;
    constructor(maxSize?: number, ttlHours?: number);
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    clear(): void;
    size(): number;
}
