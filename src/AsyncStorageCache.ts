import { MemoryLRUCache, DEFAULT_CACHE_SIZE } from './MemoryLRUCache';

interface CacheItem {
  value: string;
  timestamp: number;
}

/**
 * Hybrid cache that combines fast in-memory LRU cache with AsyncStorage persistence
 * Optimized for Expo applications that may not have MMKV available
 */
export class AsyncStorageCache {
  private memoryCache: MemoryLRUCache;
  private asyncStorage: any;
  private ttl: number;
  private storagePrefix = 'livei18n_cache_';

  constructor(maxMemorySize: number = DEFAULT_CACHE_SIZE, ttlHours: number = 1) {
    this.ttl = ttlHours * 60 * 60 * 1000; // Convert to milliseconds
    this.memoryCache = new MemoryLRUCache(maxMemorySize, ttlHours);
    
    try {
      // Try to import AsyncStorage
      this.asyncStorage = require('@react-native-async-storage/async-storage').default;
      console.log('LiveI18n: AsyncStorage persistent cache initialized');
    } catch (error) {
      console.warn('LiveI18n: AsyncStorage not available, falling back to memory-only cache');
      this.asyncStorage = null;
    }
  }

  /**
   * Reusable eviction handler to keep AsyncStorage in sync with memory cache
   */
  private onEvict = (evictedKey: string): void => {
    this.removeFromAsyncStorage(evictedKey);
  };

  get(key: string): string | undefined {
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
  private async loadFromAsyncStorage(key: string): Promise<void> {
    if (!this.asyncStorage) return;

    try {
      const persistentData = await this.asyncStorage.getItem(this.storagePrefix + key);
      if (persistentData) {
        const item: CacheItem = JSON.parse(persistentData);
        
        // Check if item has expired
        if (Date.now() - item.timestamp > this.ttl) {
          await this.asyncStorage.removeItem(this.storagePrefix + key);
          return;
        }

        // Put in memory cache for faster future access
        this.memoryCache.set(key, item.value, this.onEvict);
      }
    } catch (error) {
      console.warn('LiveI18n: Error reading from AsyncStorage cache:', error);
    }
  }

  set(key: string, value: string): void {
    // Store in memory cache with eviction callback to keep AsyncStorage in sync
    this.memoryCache.set(key, value, this.onEvict);

    // Also store in AsyncStorage for persistence (fire and forget)
    this.saveToAsyncStorage(key, value);
  }

  /**
   * Background method to save to AsyncStorage
   */
  private async saveToAsyncStorage(key: string, value: string): Promise<void> {
    if (!this.asyncStorage) return;

    try {
      const item: CacheItem = {
        value,
        timestamp: Date.now()
      };
      await this.asyncStorage.setItem(this.storagePrefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('LiveI18n: Error writing to AsyncStorage cache:', error);
    }
  }

  /**
   * Background method to remove from AsyncStorage
   */
  private async removeFromAsyncStorage(key: string): Promise<void> {
    if (!this.asyncStorage) return;

    try {
      await this.asyncStorage.removeItem(this.storagePrefix + key);
    } catch (error) {
      console.warn('LiveI18n: Error removing from AsyncStorage cache:', error);
    }
  }

  clear(): void {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear AsyncStorage (fire and forget)
    this.clearAsyncStorage();
  }

  /**
   * Background method to clear AsyncStorage
   */
  private async clearAsyncStorage(): Promise<void> {
    if (!this.asyncStorage) return;

    try {
      const keys = await this.asyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key: string) => key.startsWith(this.storagePrefix));
      if (cacheKeys.length > 0) {
        await this.asyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.warn('LiveI18n: Error clearing AsyncStorage cache:', error);
    }
  }

  size(): number {
    // Return memory cache size (AsyncStorage doesn't provide easy size calculation)
    return this.memoryCache.size();
  }

  /**
   * Get statistics about both cache layers
   */
  getCacheStats(): { memory: number; persistent: boolean; asyncStorageAvailable: boolean } {
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
  async preloadCache(maxItems: number = 50): Promise<void> {
    if (!this.asyncStorage) return;

    try {
      const keys = await this.asyncStorage.getAllKeys();
      const cacheKeys = keys
        .filter((key: string) => key.startsWith(this.storagePrefix))
        .slice(0, maxItems); // Limit to prevent memory issues

      if (cacheKeys.length > 0) {
        const items = await this.asyncStorage.multiGet(cacheKeys);
        const now = Date.now();
        let loaded = 0;

        for (const [fullKey, data] of items) {
          if (data) {
            try {
              const item: CacheItem = JSON.parse(data);
              const key = fullKey.replace(this.storagePrefix, '');
              
              // Check if item has expired
              if (now - item.timestamp <= this.ttl) {
                this.memoryCache.set(key, item.value, this.onEvict);
                loaded++;
              } else {
                // Remove expired item
                await this.asyncStorage.removeItem(fullKey);
              }
            } catch (error) {
              // Invalid data, remove it
              await this.asyncStorage.removeItem(fullKey);
            }
          }
        }

        if (loaded > 0) {
          console.log(`LiveI18n: Preloaded ${loaded} cache entries from AsyncStorage`);
        }
      }
    } catch (error) {
      console.warn('LiveI18n: Error preloading cache from AsyncStorage:', error);
    }
  }
}