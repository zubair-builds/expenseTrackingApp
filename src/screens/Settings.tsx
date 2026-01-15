import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, List, IconButton, useTheme, Snackbar, Avatar, Button as PaperButton } from 'react-native-paper';
import { Button } from '../components/Button';
import { ListView } from '../components/ListView';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PasswordItem {
    id: string;
    label: string;
    lastUsed?: string;
    createdAt: string;
}

export const SettingsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const signOut = useAuthStore((state) => state.signOut);
    const user = useAuthStore((state) => state.user);

    // View State: 'profile' or 'security'
    const [viewMode, setViewMode] = useState<'profile' | 'security'>('profile');

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: viewMode === 'profile' ? 'Profile' : 'Security',
            headerLeft: viewMode === 'security' ? () => (
                <IconButton icon="arrow-left" onPress={() => setViewMode('profile')} />
            ) : undefined
        });
    }, [navigation, viewMode]);

    // --- Password Manager Logic (Security View) ---
    const [passwords, setPasswords] = useState<PasswordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
    const [label, setLabel] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedPassword, setSelectedPassword] = useState<{ label: string, value: string } | null>(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);
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
        if (viewMode === 'security') {
            fetchPasswords();
        }
    }, [viewMode]);

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
                fetchPasswords();
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
                            fetchPasswords();
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

    const renderPasswordItem = ({ item }: { item: PasswordItem }) => (
        <List.Item
            title={item.label}
            titleStyle={styles.listItemTitle}
            description={`Created: ${new Date(item.createdAt).toLocaleDateString()}`}
            descriptionStyle={styles.listItemDescription}
            left={props => (
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                    <List.Icon {...props} icon="lock" color={theme.colors.primary} style={styles.listIcon} />
                </View>
            )}
            right={props => (
                <IconButton
                    {...props}
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => handleDeletePassword(item.id)}
                    size={20}
                />
            )}
            onPress={() => handleViewPassword(item.id, item.label)}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
        />
    );


    // --- Profile View Render ---
    if (viewMode === 'profile') {
        const MenuItem = ({ icon, label, onPress, color = theme.colors.onSurface }: any) => (
            <TouchableOpacity style={styles.menuItem} onPress={onPress}>
                <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
                    <MaterialCommunityIcons name={icon} size={22} color="#2E7D32" />
                </View>
                <Text variant="bodyLarge" style={[styles.menuLabel, { color }]}>{label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.outline} />
            </TouchableOpacity>
        );

        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Avatar.Text
                            size={72}
                            label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                            style={{ backgroundColor: theme.colors.primary }}
                        />
                        {/* Edit badge mockup */}
                        <View style={[styles.editBadge, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="pencil" size={14} color={theme.colors.primary} />
                        </View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text variant="titleLarge" style={styles.userName}>{user?.name || 'User Name'}</Text>
                        <Text variant="bodyMedium" style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                    </View>
                </View>

                {/* Account Info Section */}
                <View style={styles.section}>
                    <Text variant="labelMedium" style={styles.sectionHeaderLabel}>Account Info</Text>
                    <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
                        <MenuItem icon="map-marker" label="My Address" onPress={() => { }} />
                        <MenuItem icon="credit-card" label="My Card" onPress={() => { }} />
                        <MenuItem icon="history" label="Transaction History" onPress={() => { }} />
                        <MenuItem icon="shield-check" label="Security" onPress={() => setViewMode('security')} />
                    </View>
                </View>

                {/* Help & Support Section */}
                <View style={styles.section}>
                    <Text variant="labelMedium" style={styles.sectionHeaderLabel}>Help & Support</Text>
                    <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
                        <MenuItem icon="help-circle" label="Help Center" onPress={() => { }} />
                        <MenuItem icon="account-multiple-plus" label="Invite Friends" onPress={() => { }} />
                        <MenuItem icon="shield-lock" label="Privacy Policy" onPress={() => { }} />
                    </View>
                </View>

                <View style={{ flex: 1 }} />

                <View style={styles.logoutContainer}>
                    <Button mode="contained" onPress={signOut} style={{ backgroundColor: '#FFEBEE' }} textColor="#D32F2F">
                        Logout
                    </Button>
                </View>
            </View>
        );
    }

    // --- Security View Render (Password Manager) ---
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ListView
                data={passwords}
                renderItem={renderPasswordItem}
                keyExtractor={item => item.id}
                loading={loading}
                emptyText="No passwords saved"
                emptyIcon="lock"
                contentContainerStyle={styles.listContent}
            />

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={() => setDialogVisible(true)}
                size="medium"
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
                        <PaperButton onPress={() => setDialogVisible(false)}>Cancel</PaperButton>
                        <PaperButton onPress={handleCreatePassword} loading={saving}>Save</PaperButton>
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
                        <PaperButton onPress={() => setDetailsDialogVisible(false)}>Close</PaperButton>
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
    // Profile Styles
    profileHeader: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 20,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: 4,
        borderRadius: 12,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    userEmail: {
        opacity: 0.6,
        fontSize: 14,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeaderLabel: {
        marginBottom: 12,
        opacity: 0.7,
        fontSize: 13,
        fontWeight: '600',
    },
    menuCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontWeight: '500',
        fontSize: 15,
    },
    logoutContainer: {
        padding: 24,
        paddingBottom: 40,
    },

    // Existing/Security Styles
    listContent: {
        paddingBottom: 100,
        paddingHorizontal: 4,
        paddingTop: 8,
    },
    listItem: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        paddingVertical: 14,
        marginHorizontal: 4,
        borderRadius: 12,
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    listItemTitle: {
        fontWeight: '600',
        marginBottom: 6,
        fontSize: 15,
    },
    listItemDescription: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
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
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 40,
        borderRadius: 16,
    },
    input: {
        marginBottom: 12,
    },
});
