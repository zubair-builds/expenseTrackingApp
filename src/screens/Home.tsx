import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';

export const HomeScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    const signOut = useAuthStore((state) => state.signOut);

    const handleUploadPress = () => {
        navigation.navigate('UploadPdf');
    };

    const handleSignOut = () => {
        signOut();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                        Welcome! 👋
                    </Text>
                    <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.primary }]}>
                        {user?.email}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                        Upload your credit card statement to track your expenses
                    </Text>

                    <Button
                        onPress={handleUploadPress}
                        style={styles.uploadButton}
                    >
                        Upload Credit Card Statement (PDF)
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={handleSignOut}
                        textColor={theme.colors.error}
                        style={[styles.signOutButton, { borderColor: theme.colors.error }]}
                    >
                        Sign Out
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    card: {
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    email: {
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
    },
    uploadButton: {
        marginTop: 8,
    },
    signOutButton: {
        marginTop: 8,
    },
});
