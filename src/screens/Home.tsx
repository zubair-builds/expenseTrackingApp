import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';

export const HomeScreen = ({ navigation }: any) => {
    const user = useAuthStore((state) => state.user);
    const signOut = useAuthStore((state) => state.signOut);

    const handleUploadPress = () => {
        navigation.navigate('UploadPdf');
    };

    const handleSignOut = () => {
        signOut();
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="headlineMedium" style={styles.title}>
                        Welcome! 👋
                    </Text>
                    <Text variant="bodyLarge" style={styles.email}>
                        {user?.email}
                    </Text>
                    <Text variant="bodyMedium" style={styles.description}>
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
                        style={styles.signOutButton}
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
        backgroundColor: '#f5f5f5',
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
        color: '#6200ee',
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.7,
    },
    uploadButton: {
        marginTop: 8,
    },
    signOutButton: {
        marginTop: 8,
    },
});
