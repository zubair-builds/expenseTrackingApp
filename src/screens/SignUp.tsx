import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Snackbar } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { validateEmail, validatePassword } from '../utils/validation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';

type SignUpScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

export const SignUpScreen = ({ navigation }: SignUpScreenProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');

    const signUp = useAuthStore((state) => state.signUp);

    const validateForm = () => {
        const newErrors = { email: '', password: '', confirmPassword: '' };
        let isValid = true;

        // Email validation
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error || '';
            isValid = false;
        }

        // Password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.error || '';
            isValid = false;
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await signUp(email, password);
            setSnackbarMessage('Account created successfully!');
            setSnackbarType('success');
            setSnackbarVisible(true);
            // Navigation will happen automatically via RootNavigator when auth state changes
        } catch (error: any) {
            setSnackbarMessage(error.message || 'Sign up failed. Please try again.');
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
                    Create Account
                </Text>
                <Text variant="bodyLarge" style={styles.headerSubtitle}>
                    Join us and start managing your expenses
                </Text>
            </View>

            <View style={styles.formContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
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

                    <Input
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true}
                        error={!!errors.confirmPassword}
                        errorText={errors.confirmPassword}
                    />

                    <Button
                        onPress={handleSignUp}
                        loading={loading}
                        style={styles.signUpButton}
                        mode="contained"
                    >
                        Sign Up
                    </Button>

                    <View style={styles.footerContainer}>
                        <Text variant="bodyMedium" style={{ color: '#444' }}>
                            Already have an account?
                        </Text>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('SignIn')}
                            compact
                        >
                            Log In
                        </Button>
                    </View>
                </ScrollView>
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
        flex: 0.25,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 24,
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
        flex: 0.75,
        paddingHorizontal: 24,
    },
    signUpButton: {
        marginTop: 16,
        marginBottom: 24,
        paddingVertical: 6,
        borderRadius: 50,
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
});
