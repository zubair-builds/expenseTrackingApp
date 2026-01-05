import React, { useEffect } from 'react';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';

// Material Design 3 Light Theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0047AB', // Deep Cobalt Blue
    onPrimary: '#FFFFFF',
    primaryContainer: '#D6E4FF',
    onPrimaryContainer: '#001B3D',
    secondary: '#006D77', // Teal
    onSecondary: '#FFFFFF',
    tertiary: '#6A5ACD', // Slate Blue
    error: '#BA1A1A',
    background: '#F8F9FA', // Very light grey, premium feel
    surface: '#FFFFFF',
    surfaceVariant: '#E0E2EC',
    onSurface: '#191C1E',
  },
  roundness: 12,
};

// Material Design 3 Dark Theme
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D6E4FF', // Light Cobalt
    onPrimary: '#001B3D',
    primaryContainer: '#0047AB',
    onPrimaryContainer: '#D6E4FF',
    secondary: '#4DD0E1', // Light Teal
    onSecondary: '#00363D',
    tertiary: '#D0BCFF', // Light Slate Blue
    error: '#FFB4AB',
    background: '#1A1C1E', // Dark Grey
    surface: '#1A1C1E',
    surfaceVariant: '#43474E',
    onSurface: '#E2E2E6',
  },
  roundness: 12,
};

export default function App() {
  const scheme = useColorScheme();
  const { themeMode, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && scheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
