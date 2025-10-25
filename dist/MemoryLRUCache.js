"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryLRUCache = exports.DEFAULT_CACHE_SIZE = void 0;
exports.DEFAULT_CACHE_SIZE = 500;
/**
 * Memory-based LRU Cache implementation
 * Used as the default cache for React Native platforms
 */
class MemoryLRUCache {
    constructor(maxSize = exports.DEFAULT_CACHE_SIZE, ttlHours = 1) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttlHours * 60 * 60 * 1000; // Convert to milliseconds
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return undefined;
        // Check if item has expired
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return undefined;
        }
        // Move to end (LRU behavior)
        this.cache.delete(key);
        this.cache.set(key, item);
        return item.value;
    }
    set(key, value, onEvict) {
        // Remove oldest item if cache is full
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
                // Notify about eviction
                if (onEvict) {
                    onEvict(firstKey);
                }
            }
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
    /**
     * Get the cache TTL in milliseconds
     */
    getTtl() {
        return this.ttl;
    }
}
exports.MemoryLRUCache = MemoryLRUCache;
