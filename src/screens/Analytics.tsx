import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, SegmentedButtons, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { api } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Constants
const CHART_HEIGHT = 220;
const CHART_PADDING = 32; // Reduced padding for cleaner look
const SPACING_BOTTOM = 20;
const LOCALE = 'en-PK';

// Type Definitions
interface MonthlyTrend {
    month: string;
    totalSpending: number;
}

interface MonthlyTrendRaw {
    month: string | null | undefined;
    totalSpending: number | string | null | undefined;
}

interface CategoryBreakdownRaw {
    category: string | null | undefined;
    total: number | string | null | undefined;
}

interface MerchantRaw {
    merchant?: string | null;
    name?: string | null;
    total?: number | null;
}

interface AnalyticsSummary {
    totalStatements?: number;
    totalSpending?: number | null;
    totalCredits?: number;
    averageMonthlySpending?: number | null;
    totalTransactions?: number | null;
    mostUsedCategory?: string;
}

interface AnalyticsData {
    summary?: AnalyticsSummary;
    monthlyTrends?: MonthlyTrendRaw[];
    overallCategoryBreakdown?: CategoryBreakdownRaw[];
    topMerchantsAllTime?: MerchantRaw[];
}

interface ChartData {
    labels: string[];
    datasets: Array<{ data: number[] }>;
}

export const AnalyticsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: 'Statics' }); // Match UI3 title
    }, [navigation]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [chartView, setChartView] = useState<'line' | 'bar'>('bar'); // Default to Bar as per UI3

    const fetchAnalytics = useCallback(async () => {
        setError(null);
        try {
            const data = await api.getAnalytics();
            if (data.success && data.analytics) {
                setAnalyticsData(data.analytics);
            } else {
                setError('Failed to load analytics');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatCurrency = useCallback((amount: number | null | undefined, showSymbol = true): string => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return showSymbol ? 'Rs 0' : '0';
        }
        const formatted = new Intl.NumberFormat(LOCALE, {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount)); // Handle negative values gracefully
        return showSymbol ? `Rs ${formatted}` : formatted;
    }, []);

    const normalizeMonth = useCallback((monthStr: string | null | undefined): string | null => {
        if (!monthStr || typeof monthStr !== 'string') return null;
        try {
            const date = new Date(monthStr);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                return `${year}-${month}`;
            }
            // ... (keep existing regex logic if needed, omitted for brevity but logic remains same)
            return monthStr.substring(0, 7);
        } catch {
            return null;
        }
    }, []);

    const removeDuplicateMonths = useCallback((trends: MonthlyTrendRaw[]): MonthlyTrend[] => {
        const monthMap = new Map<string, MonthlyTrend>();
        trends.forEach((m) => {
            const normalizedMonth = normalizeMonth(m.month);
            if (!normalizedMonth) return;
            const val = typeof m.totalSpending === 'string' ? parseFloat(m.totalSpending) : (m.totalSpending ?? 0);
            if (isNaN(val) || val < 0) return;

            const existing = monthMap.get(normalizedMonth);
            if (!existing || val > existing.totalSpending) {
                monthMap.set(normalizedMonth, { month: m.month || '', totalSpending: val });
            }
        });
        return Array.from(monthMap.values()).sort((a, b) => {
            const aNorm = normalizeMonth(a.month) || '';
            const bNorm = normalizeMonth(b.month) || '';
            return aNorm.localeCompare(bNorm);
        });
    }, [normalizeMonth]);

    const formatYLabel = useCallback((value: string): string => {
        try {
            const num = parseFloat(value);
            if (isNaN(num)) return '0';
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
            return num.toFixed(0);
        } catch {
            return '0';
        }
    }, []);

    const processedMonthlyTrends = useMemo(() => {
        if (!analyticsData?.monthlyTrends || !Array.isArray(analyticsData.monthlyTrends)) return [];
        return removeDuplicateMonths(analyticsData.monthlyTrends);
    }, [analyticsData?.monthlyTrends, removeDuplicateMonths]);

    const chartData = useMemo((): ChartData => {
        if (processedMonthlyTrends.length === 0) return { labels: [], datasets: [{ data: [] }] };
        const labels: string[] = [];
        const data: number[] = [];
        // Take last 4 months for cleaner view like UI3 if many, or all if few
        const displayData = processedMonthlyTrends.slice(-6);

        displayData.forEach((m) => {
            const date = new Date(m.month);
            const label = !isNaN(date.getTime())
                ? date.toLocaleDateString(LOCALE, { month: 'short' })
                : (m.month.substring(0, 3) || '?');
            labels.push(label);
            data.push(m.totalSpending);
        });
        return { labels, datasets: [{ data }] };
    }, [processedMonthlyTrends]);

    const topMerchant = useMemo(() => {
        return analyticsData?.topMerchantsAllTime?.[0]?.merchant ||
            analyticsData?.topMerchantsAllTime?.[0]?.name || null;
    }, [analyticsData?.topMerchantsAllTime]);

    const chartWidth = useMemo(() => Math.max(200, screenWidth - 48), [screenWidth]);

    if (loading && !refreshing) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
    }

    const summary = analyticsData?.summary;
    const CHART_COLOR = '#2E7D32'; // Dark Green
    const CHART_BG = 'rgba(255, 255, 255, 0)';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
        >
            {/* Total Spending Header */}
            <View style={styles.headerSection}>
                <Text variant="labelMedium" style={styles.headerLabel}>Total Spending</Text>
                <View style={styles.amountRow}>
                    <Text variant="displaySmall" style={styles.headerAmount}>
                        {summary ? formatCurrency(summary.totalSpending) : '...'}
                    </Text>
                    {/* Optional: Add period selector here if implemented later */}
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <SegmentedButtons
                    value={chartView}
                    density="small"
                    onValueChange={(value) => setChartView(value as typeof chartView)}
                    buttons={[
                        { value: 'line', label: 'Line' },
                        { value: 'bar', label: 'Bar' },
                    ]}
                    style={{ marginBottom: 16, alignSelf: 'flex-end', transform: [{ scale: 0.8 }] }}
                />

                {chartData.labels.length > 0 ? (
                    chartView === 'bar' ? (
                        <BarChart
                            data={chartData}
                            width={chartWidth}
                            height={CHART_HEIGHT}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: CHART_BG,
                                backgroundGradientFrom: theme.colors.background,
                                backgroundGradientTo: theme.colors.background,
                                decimalPlaces: 0,
                                color: (opacity = 1) => CHART_COLOR,
                                labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
                                barPercentage: 0.6,
                                formatYLabel,
                                propsForBackgroundLines: { strokeDasharray: '', stroke: '#E0E0E0', strokeWidth: 0.5 },
                            }}
                            style={{ paddingRight: 0 }}
                            showValuesOnTopOfBars={false} // Clean look
                            fromZero
                        />
                    ) : (
                        <LineChart
                            data={chartData}
                            width={chartWidth}
                            height={CHART_HEIGHT}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: CHART_BG,
                                backgroundGradientFrom: theme.colors.background,
                                backgroundGradientTo: theme.colors.background,
                                decimalPlaces: 0,
                                color: (opacity = 1) => CHART_COLOR,
                                labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
                                propsForDots: { r: "4", strokeWidth: "2", stroke: CHART_COLOR },
                                formatYLabel,
                                propsForBackgroundLines: { strokeDasharray: '', stroke: '#E0E0E0', strokeWidth: 0.5 },
                            }}
                            style={{ paddingRight: 0 }}
                            bezier
                            fromZero
                        />
                    )
                ) : (
                    <View style={styles.noDataChart}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>No chart data available</Text>
                    </View>
                )}
            </View>

            {/* Stats Cards Row */}
            <View style={styles.statsRow}>
                {/* Available / Income Placeholder (using Avg as filler for now as per plan logic) */}
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialCommunityIcons name="wallet-outline" size={24} color="#2E7D32" />
                    </View>
                    <Text variant="labelMedium" style={styles.statLabel}>Avg. Monthly</Text>
                    <Text variant="titleMedium" style={styles.statValue}>
                        {summary ? formatCurrency(summary.averageMonthlySpending) : '-'}
                    </Text>
                </View>

                {/* Expenses / Transactions */}
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                        <MaterialCommunityIcons name="script-text-outline" size={24} color="#C62828" />
                    </View>
                    <Text variant="labelMedium" style={styles.statLabel}>Transactions</Text>
                    <Text variant="titleMedium" style={styles.statValue}>
                        {summary?.totalTransactions || 0}
                    </Text>
                </View>
            </View>

            {/* Top Merchant Row (can be 'Recent Transaction' style or similar) */}
            <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Top Merchant</Text>
            </View>

            <View style={[styles.merchantCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.iconContainerLarge, { backgroundColor: '#E3F2FD' }]}>
                    <MaterialCommunityIcons name="store-marker-outline" size={28} color="#1565C0" />
                </View>
                <View style={styles.merchantInfo}>
                    <Text variant="titleMedium" style={styles.merchantName}>{topMerchant || 'No Data'}</Text>
                    <Text variant="bodySmall" style={styles.merchantSub}>Most frequent spending</Text>
                </View>
                {/* Optional: Add amount if available in updated API */}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { padding: 20 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerSection: { marginBottom: 32 },
    headerLabel: { opacity: 0.6, fontSize: 14, marginBottom: 8 },
    amountRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    headerAmount: { fontWeight: '800', letterSpacing: -1 },

    chartContainer: { marginBottom: 32 },
    noDataChart: { height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 32 },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        // Shadow for iOS/Android
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    iconContainer: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12
    },
    statLabel: { opacity: 0.6, marginBottom: 4 },
    statValue: { fontWeight: '700', fontSize: 18 },

    sectionHeader: { marginBottom: 12 },
    sectionTitle: { fontWeight: '700' },

    merchantCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    iconContainerLarge: {
        width: 48, height: 48, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    merchantInfo: { flex: 1 },
    merchantName: { fontWeight: '700', fontSize: 16 },
    merchantSub: { opacity: 0.6 }
});

