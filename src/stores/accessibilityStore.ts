import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AccessibilityTheme = 'default' | 'dark' | 'high-contrast' | 'colorblind';

export const TEXT_SCALE_STEPS = [0.875, 1, 1.125, 1.25] as const;

interface AccessibilityState {
  theme: AccessibilityTheme;
  textScale: (typeof TEXT_SCALE_STEPS)[number];
  reduceMotion: boolean;
  liveMessage: string;
  setTheme: (theme: AccessibilityTheme) => void;
  setTextScale: (scale: AccessibilityState['textScale']) => void;
  setReduceMotion: (enabled: boolean) => void;
  announce: (message: string) => void;
  reset: () => void;
}

const defaultAccessibilityState: Pick<AccessibilityState, 'theme' | 'textScale' | 'reduceMotion'> = {
  theme: 'default',
  textScale: 1,
  reduceMotion: false,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      ...defaultAccessibilityState,
      liveMessage: '',
      setTheme: (theme) => set({ theme }),
      setTextScale: (textScale) => set({ textScale }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      announce: (liveMessage) => set({ liveMessage }),
      reset: () => set({ ...defaultAccessibilityState, liveMessage: '' }),
    }),
    {
      name: 'accessibility-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        textScale: state.textScale,
        reduceMotion: state.reduceMotion,
      }),
    },
  ),
);