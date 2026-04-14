import { useAccessibilityStore, type AccessibilityTheme } from '@/stores/accessibilityStore';

const THEME_CLASSNAMES: AccessibilityTheme[] = ['default', 'dark', 'high-contrast', 'colorblind'];

function applyTheme(root: HTMLElement, theme: AccessibilityTheme) {
  root.classList.toggle('dark', theme === 'dark');

  THEME_CLASSNAMES.forEach((item) => {
    root.classList.toggle(`theme-${item}`, theme === item);
  });

  root.dataset.theme = theme;
}

function applyTextScale(root: HTMLElement, textScale: number) {
  root.style.setProperty('--app-font-scale', textScale.toString());
}

function applyReduceMotion(root: HTMLElement, reduceMotion: boolean) {
  root.classList.toggle('reduce-motion', reduceMotion);
}

export function applyAccessibilitySettings() {
  const root = document.documentElement;
  const { theme, textScale, reduceMotion } = useAccessibilityStore.getState();

  applyTheme(root, theme);
  applyTextScale(root, textScale);
  applyReduceMotion(root, reduceMotion);
}

export function subscribeToAccessibilityChanges() {
  const unsubscribe = useAccessibilityStore.subscribe((state) => {
    const root = document.documentElement;
    applyTheme(root, state.theme);
    applyTextScale(root, state.textScale);
    applyReduceMotion(root, state.reduceMotion);
  });

  return unsubscribe;
}
