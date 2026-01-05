import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Snackbar } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { validateEmail, validatePassword } from '../utils/validation';

export const SignInScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error || '';
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
            style={styles.container}
        >
            <View style={styles.headerContainer}>
                <Text variant="displaySmall" style={styles.headerTitle}>
                    Welcome back
                </Text>
                <Text variant="bodyLarge" style={styles.headerSubtitle}>
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
                    secureTextEntry={true}
                    error={!!errors.password}
                    errorText={errors.password}
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
                    <Text variant="bodyMedium" style={{ color: '#444' }}>
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

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{
                    backgroundColor: snackbarType === 'error' ? '#BA1A1A' : '#006D77',
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
        backgroundColor: '#F8F9FA',
    },
    headerContainer: {
        flex: 0.35,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    headerTitle: {
        color: '#0047AB',
        fontWeight: '700',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: '#555',
    },
    formContainer: {
        flex: 0.65,
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
        borderRadius: 50, // Pill shape for primary actions
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 32,
    },
    // Remnants of old styles removed
});
