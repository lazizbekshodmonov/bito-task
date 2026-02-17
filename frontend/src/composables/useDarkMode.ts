import { ref } from "vue";

const STORAGE_KEY = "mockly_dark_mode";

const isDark = ref(localStorage.getItem(STORAGE_KEY) === "true");

/**
 * Applies or removes the "dark" CSS class on the document root element.
 *
 * @param dark - Whether to enable dark mode
 * @returns void
 */
const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark);
};

// Apply on init
applyTheme(isDark.value);

/**
 * Composable that provides dark mode state and toggle functionality.
 * Persists the dark mode preference in localStorage and applies the CSS class
 * to the document root element.
 *
 * @returns An object containing isDark ref and toggle function
 */
export const useDarkMode = () => {
  /**
   * Toggles between dark and light mode, persists the preference to localStorage,
   * and applies the corresponding CSS class to the document root element.
   *
   * @returns void
   */
  const toggle = () => {
    isDark.value = !isDark.value;
    localStorage.setItem(STORAGE_KEY, String(isDark.value));
    applyTheme(isDark.value);
  };

  return { isDark, toggle };
};
