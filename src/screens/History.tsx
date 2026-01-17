import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button, List, IconButton, Snackbar } from 'react-native-paper';
import { api, PdfItem } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListView } from '../components/ListView';
import { SkeletonLoader } from '../components/SkeletonLoader';

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

    // Helper function to normalize strings for comparison
    const normalizeString = (str: string | null | undefined): string => {
        if (!str) return '';
        return str.toLowerCase().trim();
    };

    // Helper function to score how complete a PDF item is (for keeping best version)
    const getCompletenessScore = (pdf: PdfItem): number => {
        let score = 0;
        if (pdf.documentType === 'statement') score += 10;
        if (pdf.statementDate) score += 5;
        if (pdf.newBalance !== null && pdf.newBalance !== undefined) score += 5;
        if (pdf.analysisTime) score += 2;
        if (pdf.extractedPages > 0) score += 2;
        if (pdf.unlockStatus === 'success') score += 3;
        return score;
    };

    const removeDuplicates = (pdfs: PdfItem[]): PdfItem[] => {
        // Track seen values for each field
        const seenFilenames = new Map<string, PdfItem>();
        const seenOriginalFilenames = new Map<string, PdfItem>();
        const seenStatementDates = new Map<string, PdfItem>();
        
        // Track all items that are duplicates
        const duplicateIds = new Set<string>();
        const keptItems = new Map<string, PdfItem>(); // key: pdf.id
        
        pdfs.forEach(pdf => {
            const normalizedFilename = normalizeString(pdf.filename);
            const normalizedOriginalFilename = normalizeString(pdf.originalFilename);
            const normalizedStatementDate = normalizeString(pdf.statementDate);
            
            let isDuplicate = false;
            let existingItem: PdfItem | null = null;
            
            // Check if filename matches
            if (normalizedFilename && seenFilenames.has(normalizedFilename)) {
                isDuplicate = true;
                existingItem = seenFilenames.get(normalizedFilename)!;
            }
            // Check if originalFilename matches
            else if (normalizedOriginalFilename && seenOriginalFilenames.has(normalizedOriginalFilename)) {
                isDuplicate = true;
                existingItem = seenOriginalFilenames.get(normalizedOriginalFilename)!;
            }
            // Check if statementDate matches (only for statements)
            else if (normalizedStatementDate && pdf.documentType === 'statement' && seenStatementDates.has(normalizedStatementDate)) {
                isDuplicate = true;
                existingItem = seenStatementDates.get(normalizedStatementDate)!;
            }
            
            if (isDuplicate && existingItem) {
                // Duplicate found - decide which one to keep
                duplicateIds.add(pdf.id);
                
                const existingScore = getCompletenessScore(existingItem);
                const currentScore = getCompletenessScore(pdf);
                
                // Keep the one with higher completeness score
                if (currentScore > existingScore) {
                    // Current is better - replace existing
                    duplicateIds.add(existingItem.id);
                    keptItems.delete(existingItem.id);
                    keptItems.set(pdf.id, pdf);
                    
                    // Update the tracking maps
                    if (normalizedFilename) seenFilenames.set(normalizedFilename, pdf);
                    if (normalizedOriginalFilename) seenOriginalFilenames.set(normalizedOriginalFilename, pdf);
                    if (normalizedStatementDate) seenStatementDates.set(normalizedStatementDate, pdf);
                } else if (currentScore === existingScore) {
                    // Same score - keep the more recent one
                    const existingDate = new Date(existingItem.createdAt).getTime();
                    const currentDate = new Date(pdf.createdAt).getTime();
                    
                    if (currentDate > existingDate) {
                        // Current is more recent - replace existing
                        duplicateIds.add(existingItem.id);
                        keptItems.delete(existingItem.id);
                        keptItems.set(pdf.id, pdf);
                        
                        // Update the tracking maps
                        if (normalizedFilename) seenFilenames.set(normalizedFilename, pdf);
                        if (normalizedOriginalFilename) seenOriginalFilenames.set(normalizedOriginalFilename, pdf);
                        if (normalizedStatementDate) seenStatementDates.set(normalizedStatementDate, pdf);
                    }
                    // Otherwise keep existing (it's already in keptItems)
                }
                // Otherwise keep existing (it's already in keptItems)
            } else {
                // Not a duplicate - add to kept items and tracking maps
                keptItems.set(pdf.id, pdf);
                
                if (normalizedFilename) {
                    seenFilenames.set(normalizedFilename, pdf);
                }
                if (normalizedOriginalFilename) {
                    seenOriginalFilenames.set(normalizedOriginalFilename, pdf);
                }
                if (normalizedStatementDate && pdf.documentType === 'statement') {
                    seenStatementDates.set(normalizedStatementDate, pdf);
                }
            }
        });
        
        // Log duplicates found (optional, for debugging)
        const duplicatesCount = duplicateIds.size;
        if (duplicatesCount > 0) {
            console.log(`Removed ${duplicatesCount} duplicate statement(s) based on filename/originalFilename/statementDate`);
        }
        
        // Return unique items, sorted by statement date (newest first) or creation date
        const result = Array.from(keptItems.values());
        return result.sort((a, b) => {
            // Prefer statement date if available, otherwise use creation date
            const aDate = a.statementDate && isValidDate(a.statementDate) 
                ? new Date(a.statementDate).getTime() 
                : new Date(a.createdAt).getTime();
            const bDate = b.statementDate && isValidDate(b.statementDate)
                ? new Date(b.statementDate).getTime()
                : new Date(b.createdAt).getTime();
            return bDate - aDate; // Newest first
        });
    };

    const fetchHistory = async () => {
        setError(null);
        try {
            const data = await api.getPdfs(1, 20); // Fetch first 20 for now
            if (data.success) {
                // Remove duplicates before setting state
                const uniquePdfs = removeDuplicates(data.pdfs);
                setPdfs(uniquePdfs);
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

    const isValidDate = (dateString?: string | null): boolean => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime()) && dateString !== 'Invalid Date';
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString || !isValidDate(dateString)) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatStatementMonthYear = (dateString?: string | null): string | null => {
        if (!dateString) return null;
        
        // Try multiple date parsing strategies
        let date: Date | null = null;
        
        // Strategy 1: Parse "DD MMM YYYY" format (e.g., "17 APR 2025")
        try {
            const dateMatch = dateString.match(/(\d{1,2})\s+([A-Z]{3})\s+(\d{4})/i);
            if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const monthAbbr = dateMatch[2].toUpperCase();
                const year = parseInt(dateMatch[3]);
                
                // Map 3-letter month abbreviations to month numbers (0-indexed)
                const monthMap: { [key: string]: number } = {
                    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                    'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                };
                
                const month = monthMap[monthAbbr];
                if (month !== undefined && year > 2000 && year < 2100 && day >= 1 && day <= 31) {
                    const testDate = new Date(year, month, day);
                    if (!isNaN(testDate.getTime())) {
                        return testDate.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                        });
                    }
                }
            }
        } catch (e) {
            // Continue to next strategy
        }
        
        // Strategy 2: Direct parsing
        try {
            date = new Date(dateString);
            if (!isNaN(date.getTime()) && dateString !== 'Invalid Date' && dateString.toLowerCase() !== 'invalid date') {
                const formatted = date.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });
                // Verify the formatted date is valid (not "Invalid Date")
                if (formatted && formatted !== 'Invalid Date' && !formatted.toLowerCase().includes('invalid')) {
                    return formatted;
                }
            }
        } catch (e) {
            // Continue to next strategy
        }
        
        // Strategy 3: Try parsing as ISO string or other formats
        try {
            if (dateString.includes('T') || dateString.includes('-')) {
                const isoDate = new Date(dateString);
                if (!isNaN(isoDate.getTime())) {
                    const formatted = isoDate.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                    if (formatted && formatted !== 'Invalid Date' && !formatted.toLowerCase().includes('invalid')) {
                        return formatted;
                    }
                }
            }
        } catch (e) {
            // Continue
        }
        
        // Strategy 4: Try to extract year and month from common patterns
        try {
            // Pattern: YYYY-MM-DD or similar
            const dateMatch = dateString.match(/(\d{4})[-\/](\d{1,2})/);
            if (dateMatch) {
                const year = parseInt(dateMatch[1]);
                const month = parseInt(dateMatch[2]) - 1; // JS months are 0-indexed
                if (year > 2000 && year < 2100 && month >= 0 && month < 12) {
                    const testDate = new Date(year, month, 1);
                    if (!isNaN(testDate.getTime())) {
                        return testDate.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                        });
                    }
                }
            }
        } catch (e) {
            // Ignore
        }
        
        // If all parsing fails, return null
        return null;
    };

    const formatDueDate = (dateString?: string | null): string | null => {
        if (!dateString) return null;
        
        // Try multiple date parsing strategies
        let date: Date | null = null;
        
        // Strategy 1: Parse "DD MMM YYYY" format (e.g., "07 Jan 2026")
        try {
            const dateMatch = dateString.match(/(\d{1,2})\s+([A-Z]{3})\s+(\d{4})/i);
            if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const monthAbbr = dateMatch[2].toUpperCase();
                const year = parseInt(dateMatch[3]);
                
                // Map 3-letter month abbreviations to month numbers (0-indexed)
                const monthMap: { [key: string]: number } = {
                    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                    'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                };
                
                const month = monthMap[monthAbbr];
                if (month !== undefined && year > 2000 && year < 2100 && day >= 1 && day <= 31) {
                    const testDate = new Date(year, month, day);
                    if (!isNaN(testDate.getTime())) {
                        return testDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        });
                    }
                }
            }
        } catch (e) {
            // Continue to next strategy
        }
        
        // Strategy 2: Direct parsing
        try {
            date = new Date(dateString);
            if (!isNaN(date.getTime()) && dateString !== 'Invalid Date' && dateString.toLowerCase() !== 'invalid date') {
                const formatted = date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                // Verify the formatted date is valid (not "Invalid Date")
                if (formatted && formatted !== 'Invalid Date' && !formatted.toLowerCase().includes('invalid')) {
                    return formatted;
                }
            }
        } catch (e) {
            // Continue to next strategy
        }
        
        // Strategy 3: Try parsing as ISO string or other formats
        try {
            if (dateString.includes('T') || dateString.includes('-')) {
                const isoDate = new Date(dateString);
                if (!isNaN(isoDate.getTime())) {
                    const formatted = isoDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    if (formatted && formatted !== 'Invalid Date' && !formatted.toLowerCase().includes('invalid')) {
                        return formatted;
                    }
                }
            }
        } catch (e) {
            // Continue
        }
        
        // If all parsing fails, return null
        return null;
    };

    const formatCurrency = (amount?: number | null) => {
        if (amount === undefined || amount === null) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR', // Configurable later
        }).format(amount);
    };

    const getCurrencyColor = (amount?: number | null) => {
        if (amount === undefined || amount === null) return null;
        // Use green for positive balances (expenses are typically shown as positive)
        return '#4CAF50'; // Material Design green
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
                        size={24}
                        style={styles.analyzeButton}
                    />
                );
            }
            if (item.newBalance !== null && item.newBalance !== undefined) {
                const currencyColor = getCurrencyColor(item.newBalance);
                const dueDate = formatDueDate(item.dueDate);
                return (
                    <View style={styles.currencyContainer}>
                        <Text variant="titleMedium" style={[styles.currencyText, { color: currencyColor || theme.colors.primary }]}>
                            {formatCurrency(item.newBalance)}
                        </Text>
                        {dueDate && (
                            <Text variant="bodySmall" style={[styles.dueDateText, { color: theme.colors.error }]}>
                                Due: {dueDate}
                            </Text>
                        )}
                    </View>
                );
            }
            return null;
        };

        return (
            <List.Item
                title={
                    <View style={styles.titleContainer}>
                        {isStatement && item.statementDate ? (
                            (() => {
                                const monthYear = formatStatementMonthYear(item.statementDate);
                                // If we have a valid month/year, show it; otherwise show filename
                                if (monthYear) {
                                    return (
                                        <View style={styles.statementTitleContainer}>
                                            <Text style={[styles.statementMonthYear, { color: theme.colors.onSurface }]}>
                                                {monthYear}
                                            </Text>
                                            <Text style={[styles.statementFilename, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1} ellipsizeMode="middle">
                                                {item.originalFilename}
                                            </Text>
                                        </View>
                                    );
                                } else {
                                    // Fallback: show filename if date parsing fails
                                    return (
                                        <Text style={[styles.listItemTitle, { fontWeight: '600' }]} numberOfLines={1} ellipsizeMode="middle">
                                            {item.originalFilename}
                                        </Text>
                                    );
                                }
                            })()
                        ) : (
                            <Text style={[styles.listItemTitle, { fontWeight: '600' }]} numberOfLines={1} ellipsizeMode="middle">
                                {item.originalFilename}
                            </Text>
                        )}
                    </View>
                }
                left={props => (
                    <View style={[styles.iconContainer, { backgroundColor: isStatement ? theme.colors.primaryContainer : theme.colors.errorContainer }]}>
                        <List.Icon
                            {...props}
                            icon={isStatement ? "bank-transfer" : "file-document-alert-outline"}
                            color={isStatement ? theme.colors.primary : theme.colors.error}
                            style={styles.listIcon}
                        />
                    </View>
                )}
                right={props => getRightContent(props)}
                onPress={() => {
                    if (isStatement) {
                        (navigation as any).navigate('StatementDetails', { id: item.id });
                    }
                }}
                style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
                rippleColor={theme.colors.primaryContainer}
            />
        );
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: 'Statements' });
    }, [navigation]);

    if (error && !refreshing && pdfs.length === 0) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.errorIconContainer, { backgroundColor: theme.colors.errorContainer }]}>
                    <Text style={{ fontSize: 48 }}>⚠️</Text>
                </View>
                <Text variant="titleLarge" style={[styles.errorTitle, { color: theme.colors.error, marginTop: 24, marginBottom: 8 }]}>
                    Unable to Load Statements
                </Text>
                <Text variant="bodyMedium" style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }]}>
                    {error}
                </Text>
                <Button mode="contained" onPress={fetchHistory} icon="refresh">
                    Try Again
                </Button>
            </View>
        );
    }

    if (loading && !refreshing && pdfs.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <SkeletonLoader count={5} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ListView
                data={pdfs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                loading={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                emptyText="No statements uploaded yet"
                emptyIcon="file-document-outline"
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    pdfs.length === 0 && !loading ? (
                        <View style={styles.emptyStateContainer}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text style={{ fontSize: 64 }}>📄</Text>
                            </View>
                            <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface, marginTop: 24, marginBottom: 8 }]}>
                                No Statements Yet
                            </Text>
                            <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 32 }]}>
                                Upload your first bank statement to start tracking your expenses automatically
                            </Text>
                            <Button 
                                mode="contained" 
                                onPress={() => {
                                    (navigation as any).navigate('UploadPdf');
                                }}
                                icon="upload"
                            >
                                Upload Statement
                            </Button>
                        </View>
                    ) : undefined
                }
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Close',
                    onPress: () => setSnackbarVisible(false),
                }}
                style={styles.snackbar}
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
        paddingTop: 12,
    },
    listItem: {
        paddingVertical: 16,
        marginHorizontal: 4,
        borderRadius: 12,
        marginBottom: 8,
        paddingHorizontal: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    listItemTitle: {
        fontWeight: '600',
        marginBottom: 0,
        fontSize: 15,
        lineHeight: 20,
        flex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    statementTitleContainer: {
        flex: 1,
        marginRight: 8,
    },
    statementMonthYear: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    statementFilename: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
    },
    statementDateText: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    currencyContainer: {
        justifyContent: 'center',
        marginRight: 8,
        minWidth: 100,
        alignItems: 'flex-end',
    },
    currencyText: {
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    dueDateText: {
        fontWeight: '600',
        fontSize: 12,
        marginTop: 2,
    },
    analyzeButton: {
        margin: 0,
        width: 44,
        height: 44,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    listIcon: {
        margin: 0,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorTitle: {
        fontWeight: '700',
        textAlign: 'center',
    },
    errorMessage: {
        paddingHorizontal: 32,
        lineHeight: 20,
    },
    emptyStateContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontWeight: '700',
        textAlign: 'center',
    },
    emptyDescription: {
        paddingHorizontal: 32,
        lineHeight: 22,
    },
    snackbar: {
        marginBottom: 16,
    },
});
