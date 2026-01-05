import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const TOKEN_KEY = '@auth_token';

interface User {
    email: string;
    name?: string;
    id?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,

    signIn: async (email: string, password: string) => {
        try {
            const response = await api.signIn(email, password);
            if (response.success && response.token) {
                // Store token in AsyncStorage
                await AsyncStorage.setItem(TOKEN_KEY, response.token);

                set({
                    isAuthenticated: true,
                    user: response.user,
                    token: response.token,
                });
            }
        } catch (error) {
            throw error;
        }
    },

    signUp: async (email: string, password: string) => {
        try {
            const response = await api.signUp(email, password);
            if (response.success && response.token) {
                // Store token in AsyncStorage
                await AsyncStorage.setItem(TOKEN_KEY, response.token);

                set({
                    isAuthenticated: true,
                    user: response.user,
                    token: response.token,
                });
            }
        } catch (error) {
            throw error;
        }
    },

    signOut: async () => {
        console.log('👋 Sign Out');
        // Remove token from AsyncStorage
        await AsyncStorage.removeItem(TOKEN_KEY);

        set({
            isAuthenticated: false,
            user: null,
            token: null,
        });
    },

    loadToken: async () => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token) {
                // TODO: Optionally verify token with backend
                set({
                    isAuthenticated: true,
                    token,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load token:', error);
            set({ isLoading: false });
        }
    },
}));
