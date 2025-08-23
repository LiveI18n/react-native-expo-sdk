"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryLRUCache = void 0;
/**
 * Memory-based LRU Cache implementation
 * Used as the default cache adapter across all platforms
 */
class MemoryLRUCache {
    constructor(maxSize = 500, ttlHours = 1) {
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
    set(key, value) {
        // Remove oldest item if cache is full
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
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
}
exports.MemoryLRUCache = MemoryLRUCache;
