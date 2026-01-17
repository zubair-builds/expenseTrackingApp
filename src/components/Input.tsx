import React from 'react';
import { TextInput as PaperTextInput, HelperText } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    error?: boolean;
    errorText?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    right?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    error = false,
    errorText = '',
    autoCapitalize = 'none',
    keyboardType = 'default',
    right,
}) => {
    return (
        <View style={styles.container}>
            <PaperTextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                mode="outlined"
                secureTextEntry={secureTextEntry === true}
                error={error === true}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                style={styles.input}
                right={right}
            />
            {error && errorText ? (
                <HelperText type="error" visible={true}>
                    {errorText}
                </HelperText>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    input: {
        fontSize: 16,
    },
});
