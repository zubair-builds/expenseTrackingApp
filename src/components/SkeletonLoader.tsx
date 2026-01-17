import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface SkeletonLoaderProps {
    count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 5 }) => {
    const theme = useTheme();

    const SkeletonItem = () => (
        <View style={[styles.skeletonItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.skeletonIcon, { backgroundColor: theme.colors.surfaceVariant }]} />
            <View style={styles.skeletonContent}>
                <View style={[styles.skeletonLine, styles.skeletonTitle, { backgroundColor: theme.colors.surfaceVariant }]} />
                <View style={[styles.skeletonLine, styles.skeletonMeta, { backgroundColor: theme.colors.surfaceVariant }]} />
            </View>
            <View style={[styles.skeletonAmount, { backgroundColor: theme.colors.surfaceVariant }]} />
        </View>
    );

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 12,
    },
    skeletonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 12,
        elevation: 1,
    },
    skeletonIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    skeletonContent: {
        flex: 1,
        marginRight: 12,
    },
    skeletonLine: {
        height: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    skeletonTitle: {
        width: '70%',
        height: 16,
    },
    skeletonMeta: {
        width: '50%',
        height: 12,
    },
    skeletonAmount: {
        width: 100,
        height: 20,
        borderRadius: 4,
        alignSelf: 'flex-end',
    },
});
