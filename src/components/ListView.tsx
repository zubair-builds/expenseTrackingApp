import React from 'react';
import { FlatList, FlatListProps, View, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ListViewProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
    data: T[];
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement | null;
    loading?: boolean;
    onRefresh?: () => void;
    refreshing?: boolean;
    emptyText?: string;
    emptyIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function ListView<T>({
    data,
    renderItem,
    loading = false,
    onRefresh,
    refreshing = false,
    emptyText = 'No data found',
    emptyIcon = 'file-document-outline',
    contentContainerStyle,
    ...props
}: ListViewProps<T>) {
    const theme = useTheme();

    if (loading && !refreshing && data.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            contentContainerStyle={[
                styles.listContent,
                data.length === 0 && styles.emptyListContent,
                contentContainerStyle
            ]}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                ) : undefined
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                        name={emptyIcon}
                        size={64}
                        color={theme.colors.outline}
                    />
                    <Text
                        variant="titleMedium"
                        style={{ marginTop: 16, color: theme.colors.outline, textAlign: 'center' }}
                    >
                        {emptyText}
                    </Text>
                </View>
            }
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    emptyListContent: {
        justifyContent: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
