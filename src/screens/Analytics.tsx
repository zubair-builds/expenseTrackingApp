import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, SegmentedButtons } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { api } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = () => {
    const theme = useTheme();
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR',
            maximumFractionDigits: 0,
        }).format(amount);
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
                lineChartLabels.push(m.month ? m.month.substring(0, 3) : '');
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
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                };
            })
            .filter((item) => item !== null);
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.contentContainer}
        >
            <Text variant="headlineMedium" style={styles.headerTitle}>Overview</Text>

            {/* Summary Cards Row 1 */}
            <View style={styles.row}>
                <Card style={[styles.card, styles.halfCard]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.primary }}>Total Spent</Text>
                        <Text variant="titleLarge" style={styles.amountText}>
                            {summary ? formatCurrency(summary.totalSpending) : '...'}
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={[styles.card, styles.halfCard]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.tertiary }}>Avg/Month</Text>
                        <Text variant="titleLarge" style={styles.amountText}>
                            {summary ? formatCurrency(summary.averageMonthlySpending) : '...'}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            {/* Summary Cards Row 2 */}
            <View style={styles.row}>
                <Card style={[styles.card, styles.halfCard]}>
                    <Card.Content>
                        <Text variant="labelMedium">Transactions</Text>
                        <Text variant="titleLarge" style={styles.amountText}>
                            {summary?.totalTransactions || 0}
                        </Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, styles.halfCard]}>
                    <Card.Content>
                        <Text variant="labelMedium">Top Category</Text>
                        <Text variant="titleMedium" numberOfLines={1} style={styles.amountText}>
                            {summary?.mostUsedCategory || '-'}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            {/* Charts Section */}
            <Text variant="titleLarge" style={styles.sectionTitle}>Analytics</Text>

            <SegmentedButtons
                value={chartView}
                onValueChange={setChartView}
                buttons={[
                    { value: 'spending', label: 'Trends' },
                    { value: 'categories', label: 'Categories' },
                ]}
                style={styles.segmentButton}
            />

            {chartView === 'spending' && lineChartData.length > 0 ? (
                <Card style={styles.chartCard}>
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
                                color: (opacity = 1) => `rgba(0, 71, 171, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#ffa726"
                                },
                                // Custom formatter to divide by 1000 for 'k' suffix if needed, 
                                // essentially scaling the display
                                formatYLabel: (yValue) => (parseInt(yValue) / 1000).toFixed(0),
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    </Card.Content>
                </Card>
            ) : chartView === 'categories' && pieChartData.length > 0 ? (
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.chartTitle}>Top Categories</Text>
                        <PieChart
                            data={pieChartData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                            }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            absolute
                        />
                    </Card.Content>
                </Card>
            ) : (
                <View style={[styles.card, { padding: 24, alignItems: 'center' }]}>
                    <Text>No sufficient data for charts yet.</Text>
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
        color: '#0047AB',
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
        backgroundColor: '#FFFFFF',
        elevation: 2,
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
        backgroundColor: '#FFFFFF',
        elevation: 2,
        alignItems: 'center',
    },
    chartTitle: {
        textAlign: 'center',
        marginBottom: 12,
    },
});
