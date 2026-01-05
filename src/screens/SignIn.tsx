import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Snackbar, useTheme, TextInput } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SignInScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');

    const signIn = useAuthStore((state) => state.signIn);

    const validateForm = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignIn = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await signIn(email, password);
            // Verify navigation happens via auth state change
            // We can show a success message, though it might be brief if navigation occurs immediately
            setSnackbarMessage('Login successful!');
            setSnackbarType('success');
            setSnackbarVisible(true);
        } catch (error: any) {
            console.log('Sign in error:', error);
            setSnackbarMessage(error.message || 'Login failed. Please check your credentials.');
            setSnackbarType('error');
            setSnackbarVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
                    <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: '700', marginBottom: 8 }}>
                        Welcome back
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                        Securely sign in to your financial dashboard
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email}
                        errorText={errors.email}
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={secureTextEntry}
                        error={!!errors.password}
                        errorText={errors.password}
                        right={
                            <TextInput.Icon
                                icon={secureTextEntry ? "eye" : "eye-off"}
                                onPress={() => setSecureTextEntry(!secureTextEntry)}
                            />
                        }
                    />

                    <View style={styles.forgotPasswordContainer}>
                        <Button
                            mode="text"
                            onPress={() => { }}
                            compact
                            style={styles.forgotPasswordButton}
                        >
                            Forgot Password?
                        </Button>
                    </View>

                    <Button
                        onPress={handleSignIn}
                        loading={loading}
                        style={styles.signInButton}
                        mode="contained"
                    >
                        Log In
                    </Button>

                    <View style={styles.footerContainer}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Don't have an account?
                        </Text>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('SignUp')}
                            compact
                        >
                            Create Account
                        </Button>
                    </View>
                </View>
            </ScrollView>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{
                    backgroundColor: snackbarType === 'error' ? theme.colors.error : theme.colors.primary,
                    marginBottom: 20,
                    borderRadius: 8,
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    formContainer: {
        paddingHorizontal: 24,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordButton: {
        marginVertical: 0,
    },
    signInButton: {
        marginBottom: 24,
        paddingVertical: 6,
        borderRadius: 50,
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 32,
    },
});
