import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, SegmentedButtons } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { api } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = () => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [chartView, setChartView] = useState('spending'); // 'spending' | 'categories'

    const fetchAnalytics = async () => {
        try {
            const data = await api.getAnalytics();
            if (data.success) {
                setAnalyticsData(data.analytics);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const formatCurrency = (amount: number) => {
        const formatted = new Intl.NumberFormat('en-PK', { // Using en-PK or en-US with consistent separators
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
        return `PKR\u00A0${formatted}`;
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const { summary, monthlyTrends, overallCategoryBreakdown } = analyticsData || {};

    // Prepare data for Line Chart (Monthly Trends)
    const lineChartLabels: string[] = [];
    const lineChartData: number[] = [];

    if (monthlyTrends && Array.isArray(monthlyTrends)) {
        monthlyTrends.forEach((m: any) => {
            const val = Number(m.totalSpending);
            if (!isNaN(val)) {
                // Try to parse month for better label (unique)
                let label = m.month ? m.month.substring(0, 3) : '';
                const date = new Date(m.month);
                if (!isNaN(date.getTime())) {
                    label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }
                lineChartLabels.push(label);
                lineChartData.push(val);
            }
        });
    }

    // Ensure we don't pass empty arrays to chart if length check passes but data is weird
    // Also, if all values are 0, or single value, chart kit might behave oddly, but sanitizing NaNs is step 1.

    // Prepare data for Pie Chart (Categories)
    let pieChartData: any[] = [];

    if (overallCategoryBreakdown && Array.isArray(overallCategoryBreakdown)) {
        pieChartData = overallCategoryBreakdown
            .slice(0, 5)
            .map((cat: any, index: number) => {
                const total = Number(cat.total);
                if (isNaN(total) || total <= 0) return null; // Filter out 0 or NaN

                return {
                    name: cat.category,
                    population: total,
                    color: [
                        '#0047AB', // Primary
                        '#006D77', // Secondary
                        '#6A5ACD', // Tertiary
                        '#FF9800', // Orange
                        '#E91E63', // Pink
                    ][index % 5],
                    legendFontColor: theme.colors.onSurface,
                    legendFontSize: 12,
                };
            })
            .filter((item) => item !== null);
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 16 }]}
        >
            <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.primary }]}>Overview</Text>

            {/* Summary Cards Row 1 */}
            <View style={styles.row}>
                <Card style={[styles.card, styles.halfCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.primary }}>Total Spent</Text>
                        <Text variant="titleLarge" style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
                            {summary ? formatCurrency(summary.totalSpending) : '...'}
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={[styles.card, styles.halfCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.tertiary }}>Avg/Month</Text>
                        <Text variant="titleLarge" style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
                            {summary ? formatCurrency(summary.averageMonthlySpending) : '...'}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
                            Based on uploaded statements
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            {/* Summary Cards Row 2 */}
            <View style={styles.row}>
                <Card style={[styles.card, styles.halfCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="labelMedium">Transactions</Text>
                        <Text variant="titleMedium" style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
                            {summary?.totalTransactions || 0}
                        </Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, styles.halfCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="labelMedium">Top Category</Text>
                        <Text
                            variant="titleMedium"
                            numberOfLines={1}
                            style={[
                                styles.amountText,
                                summary?.mostUsedCategory === 'Other' && {
                                    color: theme.colors.onSurfaceVariant,
                                    fontWeight: 'normal',
                                }
                            ]}
                        >
                            {summary?.mostUsedCategory || '-'}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            {/* Charts Section */}
            <Text variant="titleLarge" style={styles.sectionTitle}>Analytics</Text>

            <SegmentedButtons
                value={chartView}
                density="medium"
                onValueChange={setChartView}
                buttons={[
                    { value: 'spending', label: 'Trends' },
                    { value: 'categories', label: 'Categories' },
                ]}
                style={[styles.segmentButton, { maxWidth: 300, alignSelf: 'center' }]}
            />

            {chartView === 'spending' && lineChartData.length > 0 ? (
                <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.chartTitle}>Monthly Spending</Text>
                        <LineChart
                            data={{
                                labels: lineChartLabels,
                                datasets: [{ data: lineChartData }]
                            }}
                            width={screenWidth - 64} // Card padding + Screen padding
                            height={220}
                            yAxisLabel="PKR "
                            yAxisSuffix="k"
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: theme.colors.surface,
                                backgroundGradientFrom: theme.colors.surface,
                                backgroundGradientTo: theme.colors.surface,
                                decimalPlaces: 0,
                                color: (opacity = 1) => theme.colors.primary,
                                labelColor: (opacity = 1) => theme.colors.onSurface,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                    stroke: theme.colors.primary
                                },
                                // Compact formatting: 12500 -> 13k
                                formatYLabel: (yValue) => (parseInt(yValue) / 1000).toFixed(0),
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    </Card.Content>
                </Card>
            ) : chartView === 'categories' && pieChartData.length > 0 ? (
                <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.chartTitle}>Top Categories</Text>
                        <PieChart
                            data={pieChartData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => theme.colors.secondary,
                            }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            absolute
                        />
                    </Card.Content>
                </Card>
            ) : (
                <View style={[styles.card, { padding: 32, alignItems: 'center', backgroundColor: theme.colors.surfaceVariant, borderRadius: 16 }]}>
                    <ActivityIndicator size="small" style={{ marginBottom: 16, display: 'none' }} />
                    {/* Just using surfaceVariant for a subtle block, no icon needed if we want to be minimal, 
                        but let's make it look intentional. */}
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                        Not enough data yet
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline, textAlign: 'center', marginTop: 4 }}>
                        Upload more statements to see trends
                    </Text>
                </View>
            )}

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    contentContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    card: {
        elevation: 1,
    },
    halfCard: {
        width: '48%',
    },
    amountText: {
        fontWeight: 'bold',
        marginTop: 4,
    },
    segmentButton: {
        marginBottom: 16,
    },
    chartCard: {
        elevation: 1,
        alignItems: 'center',
    },
    chartTitle: {
        textAlign: 'center',
        marginBottom: 12,
    },
});
