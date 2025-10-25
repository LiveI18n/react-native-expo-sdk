# LiveI18n Expo SDK

Real-time AI-powered translation SDK optimized for Expo applications. Translate your Expo app content on-demand with intelligent caching and Expo-specific optimizations.

## Features

- ⚡ **Real-time AI Translation** - Powered by advanced language models
- 🥇 **Expo Optimized** - Built specifically for Expo managed workflow
- ⚡ **Request Batching** - Multiple translation requests are batched for efficiency (10 requests or 50ms timeout)
- 🚀 **High Performance** - Intelligent hybrid caching with AsyncStorage persistence  
- 🌍 **Expo Localization** - Automatic locale detection using `expo-localization`
- 🔄 **Smart Retry Logic** - Robust error handling with exponential backoff
- 💾 **Persistent Storage** - AsyncStorage integration with preloading for optimal performance
- 🎯 **Fragment-based** - Returns React fragments for flexible usage with Text components
- 🌐 **RTL Support** - Automatic right-to-left language detection

## Installation

```bash
npx expo install @livei18n/react-native-expo-sdk expo-localization @react-native-async-storage/async-storage
```

- `expo-localization` - For automatic locale detection and RTL support
- `@react-native-async-storage/async-storage` - For persistent caching

## Quick Start

### 1. Wrap Your App with Provider

```typescript
import React from 'react';
import { LiveI18nProvider } from '@livei18n/react-native-expo-sdk';
import YourApp from './YourApp';

export default function App() {
  return (
    <LiveI18nProvider config={{
      apiKey: 'your-api-key',
      customerId: 'your-customer-id',
      defaultLanguage: 'es-ES',
      batch_requests: true, // Enable batching for efficiency
      cache: {
        persistent: true, // Use AsyncStorage for persistence
        entrySize: 500,
        ttlHours: 24,
        preload: true // Preload cache on startup for better performance
      }
    }}>
      <YourApp />
    </LiveI18nProvider>
  );
}
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
import React from 'react';
import { useLiveI18n } from '@livei18n/react-native-expo-sdk';

const MyComponent = () => {
  const { 
    translate: translateText, 
    getPreferredLocales,
    getDetailedLocale,
    isRTL,
    updateDefaultLanguage,
    defaultLanguage
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

  const changeLanguage = (language: string) => {
    updateDefaultLanguage(language);
  };

  return (
    // Your component JSX with access to all translation utilities
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
  batch_requests?: boolean; // Enable request batching for efficiency (default: true)
  debug?: boolean; // Enable debug logging (default: false)
  cache?: {
    persistent?: boolean; // Use AsyncStorage persistent cache (default: true)
    entrySize?: number; // Number of cache entries (default: 500)
    ttlHours?: number; // Cache TTL in hours (default: 1)
    preload?: boolean; // Preload cache on initialization (default: true)
  };
}
```

## Request Batching

By default, the SDK automatically batches translation requests that aren't found in cache for improved performance:

```typescript
<LiveI18nProvider config={{
  apiKey: 'your-api-key',
  customerId: 'your-customer-id',
  batch_requests: true  // Default: true
}}>
  <View>
    {/* These requests will be batched together if not cached */}
    <Text><LiveText>Hello</LiveText></Text>
    <Text><LiveText>World</LiveText></Text>
    <Text><LiveText>Welcome</LiveText></Text>
  </View>
</LiveI18nProvider>
```

**Batching behavior:**
- Only requests that miss cache are batched
- Batches are sent when 10 requests are queued OR after 50ms timeout
- If batch API fails, individual requests are sent as fallback
- Can be disabled by setting `batch_requests: false`

**Benefits:**
- Reduces API calls and improves performance
- More efficient for apps with many simultaneous translations
- Transparent to your components - no code changes needed
- Especially beneficial on mobile where network requests are more expensive

## Caching Options

### AsyncStorage Persistent Caching (Recommended)
```typescript
<LiveI18nProvider config={{
  apiKey: 'your-api-key',
  customerId: 'your-customer-id',
  batch_requests: true,
  cache: {
    persistent: true,  // Enables AsyncStorage + memory hybrid cache
    entrySize: 500,    // Cache entries
    ttlHours: 24,      // 24-hour cache TTL
    preload: true      // Preload cache on app startup
  }
}}>
  <YourApp />
</LiveI18nProvider>
```

### Memory-Only Caching
```typescript
<LiveI18nProvider config={{
  apiKey: 'your-api-key',
  customerId: 'your-customer-id',
  cache: {
    persistent: false, // Disables AsyncStorage
    entrySize: 500     // Memory cache entries
  }
}}>
  <YourApp />
</LiveI18nProvider>
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

### Hooks

#### `useLiveI18n()`
Main hook for accessing all SDK functionality. Must be used within LiveI18nProvider.

Returns an object with:
- `translate()` - Programmatic translation function
- `defaultLanguage` - Current default language
- `updateDefaultLanguage()` - Change the default language
- `clearCache()` - Clear translation cache
- `getPreferredLocales()` - Get device's preferred languages
- `getDetailedLocale()` - Get detailed locale information
- `isRTL()` - Check if current language is right-to-left

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
// Automatic preloading (recommended)
<LiveI18nProvider config={{
  apiKey: 'your-api-key',
  customerId: 'your-customer-id',
  cache: { preload: true } // Loads recent translations on startup
}}>
  <YourApp />
</LiveI18nProvider>

// Clear cache when needed
function SettingsScreen() {
  const { clearCache } = useLiveI18n();
  
  const handleClearCache = () => {
    clearCache();
    console.log('Translation cache cleared');
  };
  
  return (
    <Button title="Clear Cache" onPress={handleClearCache} />
  );
}
```

## Performance Optimizations

### Hybrid Caching Architecture
- **Memory Layer**: Fast access to recently used translations
- **AsyncStorage Layer**: Persistent storage across app restarts  
- **Background Loading**: Async loading without blocking UI

### Best Practices

1. **Wrap Early**: Place `<LiveI18nProvider>` at your app's root level
2. **Enable Preloading**: Set `preload: true` for better startup performance
3. **Wrap with Text**: Always wrap `<LiveText>` with React Native's `<Text>` component
4. **Handle RTL**: Use `isRTL()` from `useLiveI18n()` to adjust layout for right-to-left languages
5. **Cache Management**: Use `clearCache()` when needed to free memory

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