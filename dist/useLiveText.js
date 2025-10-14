"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLiveText = useLiveText;
const react_1 = require("react");
const LiveText_1 = require("./LiveText");
const loadingIndicator_1 = require("./loadingIndicator");
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
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { translate, defaultLanguage } = (0, LiveText_1.useLiveI18n)();
    const context = (0, react_1.useContext)(LiveText_1.LiveI18nContext);
    (0, react_1.useEffect)(() => {
        var _a;
        // Don't translate empty strings
        if (!text.trim()) {
            setTranslatedText(text);
            setIsLoading(false);
            return;
        }
        // Get loading pattern from config
        const loadingPattern = ((_a = context === null || context === void 0 ? void 0 : context.instance) === null || _a === void 0 ? void 0 : _a.getLoadingPattern()) || 'none';
        // Show loading indicator
        setIsLoading(true);
        setTranslatedText((0, loadingIndicator_1.generateLoadingText)(text, loadingPattern));
        // Perform translation
        translate(text, options)
            .then((result) => {
            setTranslatedText(result);
        })
            .catch((error) => {
            console.error('useLiveText translation failed:', error);
            // Fallback to original text on error
            setTranslatedText(text);
        })
            .finally(() => {
            setIsLoading(false);
        });
    }, [
        text,
        options === null || options === void 0 ? void 0 : options.context,
        options === null || options === void 0 ? void 0 : options.tone,
        options === null || options === void 0 ? void 0 : options.language,
        defaultLanguage, // Re-translate when default language changes
        translate,
        context
    ]);
    return translatedText;
}
