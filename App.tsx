import React from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

// Material Design 3 Theme
const theme = {
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
  roundness: 12, // More modern rounded corners
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
