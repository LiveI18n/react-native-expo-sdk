interface CacheItem<V> {
  value: V;
  timestamp: number;
}

export const DEFAULT_CACHE_SIZE = 500;

/**
 * Memory-based LRU Cache implementation
 * Used as the default cache for React Native platforms
 */
export class MemoryLRUCache {
  private cache: Map<string, CacheItem<string>>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = DEFAULT_CACHE_SIZE, ttlHours: number = 1) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlHours * 60 * 60 * 1000; // Convert to milliseconds
  }

  get(key: string): string | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

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

  set(key: string, value: string, onEvict?: (evictedKey: string) => void): void {
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

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  /**
   * Get the cache TTL in milliseconds
   */
  getTtl(): number {
    return this.ttl;
  }
}