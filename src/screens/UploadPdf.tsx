import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Snackbar, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const UploadPdfScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedFile, setSelectedFile] = useState<{
        name: string;
        size: number;
        uri: string;
        mimeType: string;
    } | null>(null);
    const [password, setPassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'error' | 'success'>('error');

    const showSnackbar = (message: string, type: 'error' | 'success') => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
    };

    const handleSelectPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setSelectedFile({
                    name: file.name,
                    size: file.size || 0,
                    uri: file.uri,
                    mimeType: file.mimeType || 'application/pdf',
                });
                setUploadSuccess(false);
                setPassword(''); // Reset password on new file selection
                console.log('📄 PDF Selected:', {
                    name: file.name,
                    size: `${((file.size || 0) / 1024).toFixed(2)} KB`,
                });
            }
        } catch (error) {
            console.error('Error selecting PDF:', error);
            Alert.alert('Error', 'Failed to select PDF file'); // Alert OK for native file picker error
            showSnackbar('Failed to select file', 'error');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        if (!password || password.trim() === '') {
            showSnackbar('Please enter the PDF password', 'error');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.mimeType,
            } as any);
            formData.append('password', password);

            // Use unlockPdf to upload + unlock + process
            const response = await api.unlockPdf(formData);
            console.log('Unlock response:', response);

            setUploadSuccess(true);
            setUploadSuccess(true);
            showSnackbar('PDF unlocked and processed successfully!', 'success');
            setTimeout(() => navigation.goBack(), 1500);
        } catch (error: any) {
            console.error('Upload error:', error);
            console.error('Upload error:', error);
            showSnackbar(error.message || 'Failed to upload/unlock PDF', 'error');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="headlineSmall" style={styles.title}>
                            Upload PDF Statement
                        </Text>
                        <Text variant="bodyMedium" style={styles.description}>
                            Select your credit card statement (PDF)
                        </Text>

                        <Button
                            mode="outlined"
                            onPress={handleSelectPdf}
                            style={styles.selectButton}
                        >
                            Select PDF File
                        </Button>

                        {selectedFile && (
                            <View style={styles.fileInfo}>
                                <Card style={[styles.fileCard, { backgroundColor: theme.colors.surfaceVariant }]} mode="outlined">
                                    <Card.Content>
                                        <Text variant="labelLarge" style={styles.fileLabel}>
                                            Selected File:
                                        </Text>
                                        <Text variant="bodyLarge" style={styles.fileName}>
                                            📄 {selectedFile.name}
                                        </Text>
                                        <Text variant="bodyMedium" style={styles.fileSize}>
                                            Size: {formatFileSize(selectedFile.size)}
                                        </Text>
                                    </Card.Content>
                                </Card>

                                <View style={{ marginBottom: 16 }}>
                                    <Input
                                        label="PDF Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <Button
                                    onPress={handleUpload}
                                    loading={uploading}
                                    disabled={uploading}
                                    style={styles.uploadButton}
                                >
                                    {uploading ? 'Processing...' : 'Process Statement'}
                                </Button>
                            </View>
                        )}

                        {uploadSuccess && (
                            <Card style={[styles.successCard, { backgroundColor: theme.colors.primaryContainer }]} mode="outlined">
                                <Card.Content>
                                    <Text variant="bodyLarge" style={[styles.successText, { color: theme.colors.onPrimaryContainer }]}>
                                        Statement processed successfully!
                                    </Text>
                                </Card.Content>
                            </Card>
                        )}
                    </Card.Content>
                </Card>
            </ScrollView>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ backgroundColor: snackbarType === 'error' ? theme.colors.error : theme.colors.primary }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        marginBottom: 16,
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.7,
    },
    selectButton: {
        marginVertical: 8,
    },
    fileInfo: {
        marginTop: 16,
    },
    fileCard: {
        marginBottom: 16,
    },
    fileLabel: {
        marginBottom: 8,
    },
    fileName: {
        marginBottom: 4,
        fontWeight: '500',
    },
    fileSize: {
        opacity: 0.6,
    },
    uploadButton: {
        marginTop: 8,
    },
    successCard: {
        marginTop: 16,
        backgroundColor: '#e8f5e9', // Keep specifically green for success, or use theme success container if available
        // Better to use theme colors if we had success tokens, but hardcoded green background for success card is okayish if light.
        // Actually, let's use primaryContainer for "success-like" or surface with green text.
        borderColor: '#4caf50',
    },
    successText: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
