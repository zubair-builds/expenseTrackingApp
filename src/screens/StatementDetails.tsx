import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ListView } from '../components/ListView';
import { Text, Card, ActivityIndicator, useTheme, Divider, Avatar, List } from 'react-native-paper';
import { Button } from '../components/Button';
import { api, StatementDetail, Transaction } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

export const StatementDetailsScreen = () => {
    const theme = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
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

    const formatCurrency = (amount: number) => {
        return `Rs ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)}`;
    };



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
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
                    Something went wrong
                </Text>
                <Button mode="contained" onPress={() => navigation.goBack()}>
                    Go Back
                </Button>
            </View>
        );
    }

    const { summary, transactions } = statement;

    const getCategoryIcon = (category: string) => {
        const catLower = category.toLowerCase();
        if (catLower.includes('grocery') || catLower.includes('supermarket') || catLower.includes('store')) return { icon: 'cart-outline', color: '#2E7D32', bg: '#E8F5E9' }; // Darker Green text
        if (catLower.includes('food') || catLower.includes('dining') || catLower.includes('restaurant') || catLower.includes('burger') || catLower.includes('cafe')) return { icon: 'silverware-fork-knife', color: '#EF6C00', bg: '#FFF3E0' }; // Darker Orange
        if (catLower.includes('tech') || catLower.includes('apple') || catLower.includes('electronics') || catLower.includes('software')) return { icon: 'laptop', color: '#1565C0', bg: '#E3F2FD' }; // Darker Blue
        if (catLower.includes('entertainment') || catLower.includes('movie') || catLower.includes('netflix')) return { icon: 'movie-open-outline', color: '#7B1FA2', bg: '#F3E5F5' }; // Darker Purple
        if (catLower.includes('transport') || catLower.includes('uber') || catLower.includes('fuel') || catLower.includes('gas')) return { icon: 'car-side', color: '#455A64', bg: '#ECEFF1' }; // Darker Slate
        if (catLower.includes('health') || catLower.includes('pharmacy') || catLower.includes('doctor')) return { icon: 'medical-bag', color: '#C2185B', bg: '#FCE4EC' }; // Darker Pink
        if (catLower.includes('payment') || catLower.includes('transfer')) return { icon: 'bank-transfer', color: '#283593', bg: '#E8EAF6' }; // Darker Indigo

        return { icon: 'credit-card-outline', color: '#616161', bg: '#F5F5F5' };
    };

    const renderItem = ({ item: tx }: { item: Transaction }) => {
        const { icon, color, bg } = getCategoryIcon(tx.category);
        const isDebit = tx.type === 'DEBIT';

        return (
            <View style={[styles.transactionRow, { backgroundColor: theme.colors.surface }]}>
                {/* Icon Container */}
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                    <MaterialCommunityIcons name={icon as any} size={24} color={color} />
                </View>

                {/* Main Content */}
                <View style={styles.transactionContent}>
                    <View style={styles.topRow}>
                        <Text
                            variant="titleMedium"
                            style={[styles.merchantName, { color: theme.colors.onSurface }]}
                            numberOfLines={1}
                        >
                            {tx.description}
                        </Text>
                        <Text
                            variant="titleMedium"
                            style={[
                                styles.amountText,
                                { color: isDebit ? theme.colors.error : '#4CAF50' } // Red for Debit, Green for Credit
                            ]}
                        >
                            {formatCurrency(tx.amount)}
                        </Text>
                    </View>

                    <View style={styles.bottomRow}>
                        <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                            {tx.date}
                        </Text>

                        {/* Category Pill */}
                        <View style={[styles.categoryPill, { backgroundColor: bg }]}>
                            <Text variant="labelSmall" style={[styles.categoryText, { color: color }]}>
                                {tx.category || 'Payment'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View>
            <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={2}>
                <Card.Content style={styles.summaryCardContent}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerTextContainer}>
                            <Text variant="titleLarge" style={[styles.statementName, { color: theme.colors.onSurface }]}>{summary.name}</Text>
                            <Text variant="bodySmall" style={[styles.statementDate, { color: theme.colors.onSurfaceVariant }]}>
                                Statement Date: {summary.statementDate}
                            </Text>
                        </View>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                            <MaterialCommunityIcons name="bank" size={24} color={theme.colors.primary} />
                        </View>
                    </View>

                    <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                    <View style={[styles.balanceContainer, { backgroundColor: theme.colors.primaryContainer, padding: 16, borderRadius: 12 }]}>
                        <Text variant="labelMedium" style={[styles.balanceLabel, { color: theme.colors.onPrimaryContainer }]}>New Balance</Text>
                        <Text variant="headlineMedium" style={[styles.balanceAmount, { color: theme.colors.onPrimaryContainer }]}>
                            {formatCurrency(summary.newBalance)}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Due Date</Text>
                            <Text variant="bodyMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>{summary.dueDate}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Min Payment</Text>
                            <Text variant="bodyMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>{formatCurrency(summary.minimumPayment)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Credit Limit</Text>
                            <Text variant="bodyMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>{formatCurrency(summary.creditLimit)}</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.transactionsHeader}>
                <Text variant="titleMedium" style={[styles.transactionsTitle, { color: theme.colors.onSurface }]}>Transactions</Text>
                <View style={[styles.countBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>{transactions.length}</Text>
                </View>
            </View>
        </View>
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
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 40,
    },
    summaryCard: {
        marginBottom: 24,
        borderRadius: 24, // More rounded as per modern UI
        marginTop: 16,
    },
    summaryCardContent: {
        padding: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    statementName: {
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: -0.5,
        fontSize: 20,
    },
    statementDate: {
        fontSize: 13,
        opacity: 0.6,
        fontWeight: '500',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        marginVertical: 24,
        opacity: 0.1,
    },
    balanceContainer: {
        marginBottom: 24,
    },
    balanceLabel: {
        marginBottom: 8,
        opacity: 0.8,
        fontSize: 13,
        fontWeight: '600',
    },
    balanceAmount: {
        fontWeight: '800',
        letterSpacing: -1,
        fontSize: 32,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        marginBottom: 6,
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontWeight: '700',
        fontSize: 15,
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    transactionsTitle: {
        fontWeight: '700',
        fontSize: 18,
    },
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    // Transaction Row Styles
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transactionContent: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    merchantName: {
        fontWeight: '700',
        fontSize: 16,
        flex: 1,
        marginRight: 8,
    },
    amountText: {
        fontWeight: '700',
        fontSize: 16,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        opacity: 0.6,
        fontWeight: '500',
    },
    categoryText: {
        fontWeight: '600',
        fontSize: 10,
    },
    categoryPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
});
