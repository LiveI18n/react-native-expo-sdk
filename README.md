# LiveI18n Expo SDK

Real-time AI-powered translation SDK optimized for Expo applications. Translate your Expo app content on-demand with intelligent caching and Expo-specific optimizations.

## Features

- ⚡ **Real-time AI Translation** - Powered by advanced language models
- 🥇 **Expo Optimized** - Built specifically for Expo managed workflow
- 🚀 **High Performance** - Intelligent hybrid caching with AsyncStorage persistence  
- 🌍 **Expo Localization** - Automatic locale detection using `expo-localization`
- 🔄 **Smart Retry Logic** - Robust error handling with exponential backoff
- 💾 **Persistent Storage** - AsyncStorage integration with preloading for optimal performance
- 🎯 **Fragment-based** - Returns React fragments for flexible usage with Text components
- 🌐 **RTL Support** - Automatic right-to-left language detection

## Installation

```bash
npm install github:LiveI18n/react-native-expo-sdk
```

### Required Dependencies

For full functionality, install these Expo packages:

```bash
npx expo install expo-localization @react-native-async-storage/async-storage
```

- `expo-localization` - For automatic locale detection and RTL support
- `@react-native-async-storage/async-storage` - For persistent caching

## Quick Start

### 1. Initialize the SDK

```typescript
import { initializeLiveI18n } from '@livei18n/react-native-expo-sdk';

// Initialize at app startup (in App.js/App.tsx)
initializeLiveI18n({
  apiKey: 'your-api-key',
  customerId: 'your-customer-id',
  defaultLanguage: 'es-ES',
  cache: {
    persistent: true, // Use AsyncStorage for persistence
    memorySize: 200,
    ttlHours: 24,
    preload: true // Preload cache on startup for better performance
  }
});
```

### 2. Use the LiveText Component

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { LiveText } from '@livei18n/react-native-expo-sdk';

const MyComponent = () => {
  return (
    <View>
      <Text style={styles.title}>
        <LiveText tone="formal" context="navigation">
          Welcome to our app
        </LiveText>
      </Text>
      
      <Text style={styles.body}>
        <LiveText>
          You have {messageCount} new messages
        </LiveText>
      </Text>
    </View>
  );
};
```

### 3. Programmatic Translation with Expo Features

```typescript
import { useLiveI18n, translate } from '@livei18n/react-native-expo-sdk';

const MyComponent = () => {
  const { 
    translate: translateText, 
    getPreferredLocales,
    getDetailedLocale,
    isRTL 
  } = useLiveI18n();

  const handleTranslate = async () => {
    const result = await translateText('Hello World', {
      tone: 'casual',
      context: 'greeting'
    });
    console.log(result);
  };

  const checkLocaleInfo = () => {
    const locales = getPreferredLocales(); // ['es-ES', 'en-US', ...]
    const detailed = getDetailedLocale(); // { languageTag: 'es-ES', textDirection: 'ltr', ... }
    const rightToLeft = isRTL(); // true for Arabic, Hebrew, etc.
    
    console.log({ locales, detailed, rightToLeft });
  };

  return (
    // Your component JSX
  );
};
```

## Configuration Options

### ExpoLiveI18nConfig

```typescript
interface ExpoLiveI18nConfig {
  apiKey: string;
  customerId: string;
  endpoint?: string; // Default: 'https://api.livei18n.com'
  defaultLanguage?: string; // e.g., 'es-ES'
  cacheAdapter?: CacheAdapter; // Custom cache implementation
  cache?: {
    persistent?: boolean; // Use AsyncStorage persistent cache (default: true)
    memorySize?: number; // Memory cache size (default: 500 for memory-only, 200 for hybrid)
    ttlHours?: number; // Cache TTL in hours (default: 1)
    preload?: boolean; // Preload cache on initialization (default: true)
  };
}
```

## Caching Options

### AsyncStorage Persistent Caching (Recommended)
```typescript
initializeLiveI18n({
  apiKey: 'your-api-key',
  customerId: 'your-customer-id',
  cache: {
    persistent: true,  // Enables AsyncStorage + memory hybrid cache
    memorySize: 200,   // Smaller memory cache for hybrid mode
    ttlHours: 24,      // 24-hour cache TTL
    preload: true      // Preload cache on app startup
  }
});
```

### Memory-Only Caching
```typescript
initializeLiveI18n({
  apiKey: 'your-api-key',
  customerId: 'your-customer-id',
  cache: {
    persistent: false, // Disables AsyncStorage
    memorySize: 500    // Larger memory cache for memory-only mode
  }
});
```

## API Reference

### Components

#### `<LiveText>`

```tsx
interface LiveTextProps {
  children: React.ReactNode;
  tone?: string;
  context?: string;
  language?: string;
  fallback?: string;
  onTranslationComplete?: (original: string, translated: string) => void;
  onError?: (error: Error) => void;
}
```

### Hooks

#### `useLiveI18n()`

Returns an object with translation utilities:

```typescript
{
  translate: (text: string, options?: LiveTextOptions) => Promise<string>;
  clearCache: () => void;
  getCacheStats: () => { size: number; maxSize: number };
  updateDefaultLanguage: (language?: string) => void;
  getDefaultLanguage: () => string | undefined;
  // Expo specific utilities
  getPreferredLocales: () => string[];
  getDetailedLocale: () => any;
  isRTL: () => boolean;
}
```

### Functions

#### `initializeLiveI18n(config)`
Initialize the global SDK instance. Must be called before using components.

#### `translate(text, options?)`
Direct translation function for use outside components.

#### `getLiveI18nInstance()`
Get the global SDK instance for advanced usage.

## Expo-Specific Features

### Locale Detection
The SDK automatically uses `expo-localization` to:
- Detect user's preferred languages in order
- Get detailed locale information including text direction
- Support RTL (right-to-left) language detection

```typescript
import { useLiveI18n } from '@livei18n/react-native-expo-sdk';

const { getPreferredLocales, getDetailedLocale, isRTL } = useLiveI18n();

// Get user's language preferences
const locales = getPreferredLocales(); // ['es-MX', 'en-US', 'fr-FR']

// Get detailed locale info
const locale = getDetailedLocale();
// { languageTag: 'es-MX', textDirection: 'ltr', regionCode: 'MX', ... }

// Check if RTL layout needed
const isRightToLeft = isRTL(); // true for Arabic, Hebrew, etc.
```

### Cache Preloading
The AsyncStorage cache can preload translations on app startup:

```typescript
// Automatic preloading (default)
initializeLiveI18n({
  cache: { preload: true } // Loads up to 50 recent translations
});

// Manual preloading
import { getLiveI18nInstance } from '@livei18n/react-native-expo-sdk';

const instance = getLiveI18nInstance();
if (instance && instance.cache instanceof AsyncStorageCache) {
  await instance.cache.preloadCache(100); // Load up to 100 entries
}
```

## Performance Optimizations

### Hybrid Caching Architecture
- **Memory Layer**: Fast access to recently used translations
- **AsyncStorage Layer**: Persistent storage across app restarts  
- **Background Loading**: Async loading without blocking UI

### Best Practices

1. **Initialize Early**: Call `initializeLiveI18n()` in your app's root component
2. **Enable Preloading**: Set `preload: true` for better startup performance
3. **Wrap with Text**: Always wrap `<LiveText>` with React Native's `<Text>` component
4. **Handle RTL**: Use `isRTL()` to adjust layout for right-to-left languages
5. **Cache Management**: Monitor cache size and clear when needed

## Expo Setup

### Managed Workflow
No additional setup required. The SDK works out of the box with Expo Go and builds.

### Bare Workflow
Follow React Native setup instructions for AsyncStorage:

```bash
npx pod-install # iOS only
```

## License

MIT

## Support

For issues and questions, please visit our [GitHub repository](https://github.com/LiveI18n/react-native-expo-sdk).