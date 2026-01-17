import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={2}>
                    <Card.Content style={styles.cardContent}>
                        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                            Upload Statement
                        </Text>
                        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                            Select your credit card statement (PDF) to automatically extract and categorize transactions
                        </Text>

                        <Button
                            mode="outlined"
                            onPress={handleSelectPdf}
                            style={styles.selectButton}
                            icon="file-document-outline"
                        >
                            Select PDF File
                        </Button>

                        {selectedFile && (
                            <View style={styles.fileInfo}>
                                <Card style={[styles.fileCard, { backgroundColor: theme.colors.primaryContainer }]} mode="outlined">
                                    <Card.Content style={styles.fileCardContent}>
                                        <View style={styles.fileHeader}>
                                            <Text variant="labelLarge" style={[styles.fileLabel, { color: theme.colors.onPrimaryContainer }]}>
                                                Selected File
                                            </Text>
                                        </View>
                                        <Text variant="bodyLarge" style={[styles.fileName, { color: theme.colors.onPrimaryContainer }]} numberOfLines={2}>
                                            {selectedFile.name}
                                        </Text>
                                        <Text variant="bodySmall" style={[styles.fileSize, { color: theme.colors.onPrimaryContainer }]}>
                                            {formatFileSize(selectedFile.size)}
                                        </Text>
                                    </Card.Content>
                                </Card>

                                <View style={styles.passwordInput}>
                                    <Input
                                        label="PDF Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        placeholder="Enter PDF password"
                                    />
                                </View>

                                <Button
                                    onPress={handleUpload}
                                    loading={uploading}
                                    disabled={uploading}
                                    style={styles.uploadButton}
                                    mode="contained"
                                    icon={uploading ? undefined : "upload"}
                                >
                                    {uploading ? 'Processing...' : 'Process Statement'}
                                </Button>
                            </View>
                        )}

                        {uploadSuccess && (
                            <Card style={[styles.successCard, { backgroundColor: theme.colors.primaryContainer }]} mode="outlined">
                                <Card.Content style={styles.successCardContent}>
                                    <Text variant="bodyLarge" style={[styles.successText, { color: theme.colors.onPrimaryContainer }]}>
                                        ✓ Statement processed successfully!
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
    },
    cardContent: {
        padding: 24,
    },
    title: {
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    description: {
        marginBottom: 32,
        lineHeight: 22,
        opacity: 0.8,
    },
    selectButton: {
        marginVertical: 8,
    },
    fileInfo: {
        marginTop: 24,
    },
    fileCard: {
        marginBottom: 24,
        borderRadius: 12,
    },
    fileCardContent: {
        padding: 16,
    },
    fileHeader: {
        marginBottom: 12,
    },
    fileLabel: {
        fontWeight: '600',
        opacity: 0.9,
    },
    fileName: {
        marginBottom: 6,
        fontWeight: '600',
    },
    fileSize: {
        opacity: 0.8,
        fontSize: 12,
    },
    passwordInput: {
        marginBottom: 8,
    },
    uploadButton: {
        marginTop: 8,
    },
    successCard: {
        marginTop: 24,
        borderRadius: 12,
    },
    successCardContent: {
        padding: 16,
    },
    successText: {
        textAlign: 'center',
        fontWeight: '600',
    },
});
