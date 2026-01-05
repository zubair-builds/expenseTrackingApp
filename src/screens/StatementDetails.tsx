import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ListView } from '../components/ListView';
import { Text, Card, ActivityIndicator, useTheme, Divider, Avatar, List } from 'react-native-paper';
import { api, StatementDetail, Transaction } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatCurrency, formatDate } from '../utils/formatters';

export const StatementDetailsScreen = () => {
    const theme = useTheme();
    const route = useRoute();
    const [statement, setStatement] = useState<StatementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = route.params as { id: string };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await api.getStatementDetails(id);
                if (data.success) {
                    setStatement(data.statement);
                }
            } catch (error) {
                console.error('Failed to fetch statement details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!statement) {
        return (
            <View style={styles.errorContainer}>
                <Text variant="titleMedium">Failed to load statement details</Text>
            </View>
        );
    }

    const { summary, transactions } = statement;

    const renderHeader = () => (
        <View>
            <Card style={styles.summaryCard} mode="elevated">
                <Card.Content>
                    <View style={styles.headerRow}>
                        <View>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{summary.name}</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Statement Date: {summary.statementDate}</Text>
                        </View>
                        <MaterialCommunityIcons name="bank" size={24} color={theme.colors.primary} />
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.balanceContainer}>
                        <Text variant="labelMedium">New Balance</Text>
                        <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            {formatCurrency(summary.newBalance)}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Due Date</Text>
                            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{summary.dueDate}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Min Payment</Text>
                            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{formatCurrency(summary.minimumPayment)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Credit Limit</Text>
                            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{formatCurrency(summary.creditLimit)}</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.transactionsHeader}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Transactions</Text>
                <Text variant="labelMedium" style={{ color: theme.colors.primary }}>{transactions.length} items</Text>
            </View>
        </View>
    );

    const renderItem = ({ item: tx }: { item: Transaction }) => (
        <List.Item
            title={tx.description}
            description={`${tx.category} • ${tx.date}`}
            left={props => (
                <List.Icon
                    {...props}
                    icon={tx.type === 'DEBIT' ? "arrow-up-bold" : "arrow-down-bold"}
                    color={tx.type === 'DEBIT' ? theme.colors.error : theme.colors.primary}
                />
            )}
            right={props => (
                <View style={{ justifyContent: 'center', marginRight: 8 }}>
                    <Text
                        variant="bodyMedium"
                        style={{
                            fontWeight: 'bold',
                            color: tx.type === 'DEBIT' ? theme.colors.error : theme.colors.primary
                        }}
                    >
                        {tx.type === 'DEBIT' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </Text>
                </View>
            )}
            style={styles.listItem}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ListView
                data={transactions}
                renderItem={renderItem}
                keyExtractor={tx => tx._id}
                ListHeaderComponent={renderHeader}
                loading={false}
                emptyText="No transactions found"
                emptyIcon="bank-transfer"
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCard: {
        marginBottom: 24,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    divider: {
        marginVertical: 16,
    },
    balanceContainer: {
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 16, // Match standard padding
        marginTop: 16,
    },
    listItem: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});
