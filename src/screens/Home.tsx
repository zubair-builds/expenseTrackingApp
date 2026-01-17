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

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: 'Track Expenses' });
    }, [navigation]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={2}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.headerSection}>
                        <Text variant="headlineSmall" style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
                            Welcome back
                        </Text>
                        <Text variant="bodyMedium" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
                            {user?.email}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                    <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurface }]}>
                        Upload your bank statement (PDF) to automatically categorize and track your spending
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
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
                    </View>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        borderRadius: 16,
    },
    cardContent: {
        padding: 24,
    },
    headerSection: {
        marginBottom: 20,
    },
    welcomeText: {
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    email: {
        fontSize: 14,
        opacity: 0.7,
    },
    divider: {
        height: 1,
        marginVertical: 24,
        opacity: 0.2,
    },
    description: {
        lineHeight: 22,
        marginBottom: 32,
    },
    buttonContainer: {
        marginTop: 8,
    },
    uploadButton: {
        marginBottom: 12,
    },
    signOutButton: {
        marginTop: 4,
    },
});
