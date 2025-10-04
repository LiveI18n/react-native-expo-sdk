"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLiveText = useLiveText;
const react_1 = require("react");
const LiveText_1 = require("./LiveText");
/**
 * Hook for programmatic text translation that returns a string value
 * Expo/React Native specific version with mobile optimizations
 *
 * @param text - The text to translate
 * @param options - Translation options (context, tone, language)
 * @returns The translated text (starts with original, updates when translation completes)
 *
 * @example
 * ```tsx
 * const greeting = useLiveText("Hello World");
 * const formalGreeting = useLiveText("Welcome", {
 *   context: "homepage",
 *   tone: "professional"
 * });
 * const spanishText = useLiveText("Good morning", {
 *   language: "es-ES"
 * });
 *
 * // Usage in React Native components
 * function MyComponent() {
 *   const buttonText = useLiveText("Submit", { context: "form button" });
 *   const errorMessage = useLiveText("Network error", { tone: "apologetic" });
 *
 *   return (
 *     <View>
 *       <Text>{buttonText}</Text>
 *       <Text style={styles.error}>{errorMessage}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
function useLiveText(text, options) {
    const [translatedText, setTranslatedText] = (0, react_1.useState)(text);
    const { translate, defaultLanguage } = (0, LiveText_1.useLiveI18n)();
    (0, react_1.useEffect)(() => {
        // Don't translate empty strings
        if (!text.trim()) {
            setTranslatedText(text);
            return;
        }
        // Perform translation
        translate(text, options)
            .then((result) => {
            setTranslatedText(result);
        })
            .catch((error) => {
            console.error('useLiveText translation failed:', error);
            // Fallback to original text on error
            setTranslatedText(text);
        });
    }, [
        text,
        options === null || options === void 0 ? void 0 : options.context,
        options === null || options === void 0 ? void 0 : options.tone,
        options === null || options === void 0 ? void 0 : options.language,
        defaultLanguage, // Re-translate when default language changes
        translate
    ]);
    return translatedText;
}
