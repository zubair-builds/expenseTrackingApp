import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { formatFileSize } from '../utils/formatters';
import { isPdfFile, isValidFileSize } from '../utils/validation';

import { TextInput } from 'react-native-paper';

const MAX_FILE_SIZE_MB = 10;

export const UploadPdfScreen = ({ navigation }: any) => {
    const [selectedFile, setSelectedFile] = useState<{
        name: string;
        size: number;
        uri: string;
        mimeType: string;
    } | null>(null);
    const [password, setPassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleSelectPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                
                // Validate file type
                if (!isPdfFile(file.mimeType || '')) {
                    Alert.alert('Invalid File', 'Please select a PDF file');
                    return;
                }
                
                // Validate file size
                if (!isValidFileSize(file.size || 0, MAX_FILE_SIZE_MB)) {
                    Alert.alert('File Too Large', `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB`);
                    return;
                }
                
                setSelectedFile({
                    name: file.name,
                    size: file.size || 0,
                    uri: file.uri,
                    mimeType: file.mimeType || 'application/pdf',
                });
                setUploadSuccess(false);
                setPassword(''); // Reset password on new file selection
            }
        } catch (error) {
            console.error('Error selecting PDF');
            Alert.alert('Error', 'Failed to select PDF file');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        if (!password || password.trim() === '') {
            Alert.alert('Password Required', 'Please enter the PDF password to unlock and process it.');
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

            setUploadSuccess(true);
            Alert.alert(
                'Success! 🎉',
                'PDF unlocked and processed successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Upload failed');
            Alert.alert('Error', error.message || 'Failed to upload/unlock PDF');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
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
                            <Card style={styles.fileCard} mode="outlined">
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

                            <TextInput
                                label="PDF Password"
                                value={password}
                                onChangeText={setPassword}
                                mode="outlined"
                                secureTextEntry
                                style={{ marginBottom: 16, backgroundColor: 'white' }}
                                placeholder="Enter document password"
                            />

                            <Button
                                onPress={handleUpload}
                                loading={uploading}
                                disabled={uploading}
                                style={styles.uploadButton}
                            >
                                {uploading ? 'Unlocking & Processing...' : 'Unlock & Upload'}
                            </Button>
                        </View>
                    )}

                    {uploadSuccess && (
                        <Card style={styles.successCard} mode="outlined">
                            <Card.Content>
                                <Text variant="bodyLarge" style={styles.successText}>
                                    ✅ Processed successfully!
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    card: {
        margin: 16,
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
        backgroundColor: '#f0f0f0',
    },
    fileLabel: {
        marginBottom: 8,
        opacity: 0.7,
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
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
    },
    successText: {
        color: '#2e7d32',
        textAlign: 'center',
        fontWeight: '500',
    },
});
