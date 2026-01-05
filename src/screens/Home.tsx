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
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    <Text variant="labelLarge" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
                        {user?.email}
                    </Text>

                    <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
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
        padding: 16,
        justifyContent: 'center',
    },
    card: {
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
    },
    email: {
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 8,
    },
    uploadButton: {
        marginVertical: 8,
    },
    signOutButton: {
        marginVertical: 8,
    },
});
