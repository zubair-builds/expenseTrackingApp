import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { UploadPdfScreen } from '../screens/UploadPdf';
import { StatementDetailsScreen } from '../screens/StatementDetails';
import { useTheme } from 'react-native-paper';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const theme = useTheme();

    return (
        <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.onPrimary,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="UploadPdf"
                component={UploadPdfScreen}
                options={{ title: 'Upload Statement' }}
            />
            <Stack.Screen
                name="StatementDetails"
                component={StatementDetailsScreen}
                options={{ title: 'Statement Details' }}
            />
        </Stack.Navigator>
    );
};
