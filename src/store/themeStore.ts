import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    themeMode: 'system',
    setThemeMode: (mode) => set({ themeMode: mode }),
}));
