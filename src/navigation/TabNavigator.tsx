import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home';
import { HistoryScreen } from '../screens/History';
import { AnalyticsScreen } from '../screens/Analytics';
import { SettingsScreen } from '../screens/Settings';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.surfaceVariant,
                },
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 20,
                },
                headerTintColor: theme.colors.onSurface,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.outline,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.surfaceVariant,
                    elevation: 0,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'clock-time-three' : 'clock-time-three-outline';
                    } else if (route.name === 'Analytics') {
                        iconName = focused ? 'chart-box' : 'chart-box-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'cog' : 'cog-outline';
                    }

                    return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};
