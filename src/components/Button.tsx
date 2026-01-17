import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface ButtonProps {
    children: string;
    onPress: () => void;
    mode?: 'contained' | 'outlined' | 'text';
    loading?: boolean;
    disabled?: boolean;
    style?: object;
    compact?: boolean;
    [key: string]: any; // Allow other Paper Button props
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onPress,
    mode = 'contained',
    loading = false,
    disabled = false,
    style,
    compact = false,
    ...props
}) => {
    return (
        <PaperButton
            mode={mode}
            onPress={onPress}
            loading={loading}
            disabled={disabled || loading}
            style={[styles.button, style]}
            contentStyle={styles.buttonContent}
            compact={compact}
            {...props}
        >
            {children}
        </PaperButton>
    );
};

const styles = StyleSheet.create({
    button: {
        marginVertical: 8,
        borderRadius: 12,
        elevation: 0, // Use shadow for better control
    },
    buttonContent: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
