import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    loadTheme: () => Promise<void>;
}

const THEME_KEY = '@theme_mode';

export const useThemeStore = create<ThemeState>((set) => ({
    themeMode: 'system',

    setThemeMode: async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_KEY, mode);
            set({ themeMode: mode });
        } catch (error) {
            console.error('Failed to save theme mode:', error);
        }
    },

    loadTheme: async () => {
        try {
            const stored = await AsyncStorage.getItem(THEME_KEY);
            if (stored === 'system' || stored === 'light' || stored === 'dark') {
                set({ themeMode: stored });
            }
        } catch (error) {
            console.error('Failed to load theme mode:', error);
        }
    },
}));
