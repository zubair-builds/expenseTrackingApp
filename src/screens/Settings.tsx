import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, FAB, Dialog, Portal, TextInput, List, IconButton, useTheme, Snackbar, SegmentedButtons } from 'react-native-paper';
import { ListView } from '../components/ListView';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PasswordItem {
    id: string;
    label: string;
    lastUsed?: string;
    createdAt: string;
}

export const SettingsScreen = () => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const signOut = useAuthStore((state) => state.signOut);

    // State
    const [passwords, setPasswords] = useState<PasswordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    // Form State
    const [label, setLabel] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    // Details State
    const [selectedPassword, setSelectedPassword] = useState<{ label: string, value: string } | null>(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    // Snackbar
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchPasswords = async () => {
        try {
            const data = await api.getPasswords();
            if (data.success) {
                setPasswords(data.passwords);
            }
        } catch (error) {
            console.error('Failed to fetch passwords:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPasswords();
    }, []);

    const handleCreatePassword = async () => {
        if (!label || !passwordValue) {
            setSnackbarMessage('Label and password are required');
            setSnackbarVisible(true);
            return;
        }

        setSaving(true);
        try {
            const data = await api.createPassword(label, passwordValue);
            if (data.success) {
                setSnackbarMessage('Password saved successfully');
                setSnackbarVisible(true);
                setDialogVisible(false);
                setLabel('');
                setPasswordValue('');
                fetchPasswords(); // Refresh list
            }
        } catch (error: any) {
            setSnackbarMessage(error.message || 'Failed to save password');
            setSnackbarVisible(true);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePassword = (id: string) => {
        Alert.alert(
            "Delete Password",
            "Are you sure you want to delete this password?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.deletePassword(id);
                            fetchPasswords(); // Refresh
                            setSnackbarMessage('Password deleted');
                            setSnackbarVisible(true);
                        } catch (error) {
                            console.error('Delete error', error);
                        }
                    }
                }
            ]
        );
    };

    const handleViewPassword = async (id: string, label: string) => {
        setFetchingDetails(true);
        try {
            if (api.getPasswordDetails) {
                const data = await api.getPasswordDetails(id);
                setSelectedPassword({ label, value: data.password?.decryptedPassword || '********' });
                setDetailsDialogVisible(true);
            } else {
                setSnackbarMessage('View details not implemented on backend');
                setSnackbarVisible(true);
            }
        } catch (error) {
            setSnackbarMessage('Failed to fetch password details');
            setSnackbarVisible(true);
        } finally {
            setFetchingDetails(false);
        }
    };

    const renderItem = ({ item }: { item: PasswordItem }) => (
        <List.Item
            title={item.label}
            description={`Created: ${new Date(item.createdAt).toLocaleDateString()} `}
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => (
                <IconButton
                    {...props}
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => handleDeletePassword(item.id)}
                />
            )}
            onPress={() => handleViewPassword(item.id, item.label)}
            style={[styles.listItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    Settings
                </Text>
            </View>



            <View style={[styles.sectionHeader, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Password Manager</Text>
            </View>

            <ListView
                data={passwords}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                loading={loading}
                emptyText="No passwords saved"
                emptyIcon="lock"
                contentContainerStyle={styles.listContent}
            />

            <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}>
                <Button
                    mode="outlined"
                    onPress={signOut}
                    textColor={theme.colors.error}
                    style={{ borderColor: theme.colors.error }}
                >
                    Sign Out
                </Button>
            </View>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={() => setDialogVisible(true)}
            />

            {/* Create Password Dialog */}
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Add Password</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Label (e.g. Gmail)"
                            value={label}
                            onChangeText={setLabel}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Password"
                            value={passwordValue}
                            onChangeText={setPasswordValue}
                            style={styles.input}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleCreatePassword} loading={saving}>Save</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* View Details Dialog */}
            <Portal>
                <Dialog visible={detailsDialogVisible} onDismiss={() => setDetailsDialogVisible(false)}>
                    <Dialog.Title>{selectedPassword?.label}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyLarge">Password:</Text>
                        <Text variant="headlineSmall" selectable>{selectedPassword?.value}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDetailsDialogVisible(false)}>Close</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
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
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    appearanceContainer: {
        // No extra styling needed as margin is on SegmentedButtons
    },
    listContent: {
        paddingBottom: 80,
    },
    listItem: {
        borderBottomWidth: 1,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 80, // Above footer/tabs
    },
    input: {
        marginBottom: 12,
    },
});
