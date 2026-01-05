import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button, List, IconButton, Snackbar } from 'react-native-paper';
import { api, PdfItem } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListView } from '../components/ListView';

export const HistoryScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [pdfs, setPdfs] = useState<PdfItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchHistory = async () => {
        setError(null);
        try {
            const data = await api.getPdfs(1, 20); // Fetch first 20 for now
            if (data.success) {
                setPdfs(data.pdfs);
            } else {
                setError('Failed to load history');
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Unknown Date';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount?: number | null) => {
        if (amount === undefined || amount === null) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR', // Configurable later
        }).format(amount);
    };

    const handleAnalyze = async (pdfId: string) => {
        setAnalyzingId(pdfId);
        setSnackbarMessage('Analysis started...');
        setSnackbarVisible(true);
        try {
            const result = await api.analyzeStatement(pdfId);
            if (result.success) {
                setSnackbarMessage('Analysis complete!');
                setSnackbarVisible(true);
                fetchHistory();
            } else {
                setSnackbarMessage('Analysis failed. Please try again.');
                setSnackbarVisible(true);
            }
        } catch (error) {
            console.error('Analysis failed', error);
            setSnackbarMessage('Analysis failed. Network error.');
            setSnackbarVisible(true);
        } finally {
            setAnalyzingId(null);
        }
    };

    const renderItem = ({ item }: { item: PdfItem }) => {
        const isStatement = item.documentType === 'statement';
        const isUnknown = item.documentType === 'unknown';

        const getRightContent = (props: { color: string; style?: any }) => {
            if (isUnknown) {
                return (
                    <IconButton
                        {...props}
                        icon="auto-fix"
                        iconColor={theme.colors.primary}
                        onPress={() => handleAnalyze(item.id)}
                        loading={analyzingId === item.id}
                        disabled={analyzingId === item.id}
                    />
                );
            }
            if (item.newBalance !== null && item.newBalance !== undefined) {
                return (
                    <View style={{ justifyContent: 'center', marginRight: 8 }}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            {formatCurrency(item.newBalance)}
                        </Text>
                    </View>
                );
            }
            return null;
        };

        return (
            <List.Item
                title={item.originalFilename}
                titleStyle={{ fontWeight: '500' }}
                description={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                            {formatDate(item.createdAt)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginHorizontal: 4 }}>•</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                            {(item.fileSize / 1024).toFixed(1)} KB
                        </Text>
                        {isStatement && item.statementDate && (
                            <>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginHorizontal: 4 }}>•</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                    {formatDate(item.statementDate)}
                                </Text>
                            </>
                        )}
                    </View>
                )}
                left={props => (
                    <List.Icon
                        {...props}
                        icon={isStatement ? "bank-transfer" : "file-document-alert-outline"}
                        color={isStatement ? theme.colors.primary : theme.colors.error}
                    />
                )}
                right={props => getRightContent(props)}
                onPress={() => {
                    if (isStatement) {
                        // @ts-ignore
                        navigation.navigate('StatementDetails', { id: item.id });
                    }
                }}
                style={[styles.listItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}
            />
        );
    };

    if (error && !refreshing && pdfs.length === 0) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <Text variant="titleMedium" style={{ marginBottom: 16, color: theme.colors.error }}>
                    {error}
                </Text>
                <Button mode="contained" onPress={fetchHistory}>
                    Retry
                </Button>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 4 }}>
                    Statements
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 2 }}>
                    Monthly uploaded statements
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Tap a statement to view details or reprocess
                </Text>
            </View>

            <ListView
                data={pdfs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                emptyText="No statements uploaded yet"
                emptyIcon="file-document-outline"
                contentContainerStyle={styles.listContent}
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Close',
                    onPress: () => setSnackbarVisible(false),
                }}
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
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    listItem: {
        borderBottomWidth: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
