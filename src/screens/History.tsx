import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button, List, IconButton } from 'react-native-paper';
import { api, PdfItem } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { ListView } from '../components/ListView';

export const HistoryScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [pdfs, setPdfs] = useState<PdfItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    const fetchHistory = async () => {
        try {
            const data = await api.getPdfs(1, 20); // Fetch first 20 for now
            if (data.success) {
                setPdfs(data.pdfs);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
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
        try {
            const result = await api.analyzeStatement(pdfId);
            if (result.success) {
                // Refresh list on success to show new data
                fetchHistory();
            }
        } catch (error) {
            console.error('Analysis failed', error);
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
                style={styles.listItem}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    History
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                    {pdfs.length} documents found
                </Text>
            </View>

            <ListView
                data={pdfs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                emptyText="No history found"
                emptyIcon="file-document-outline"
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    listItem: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});
