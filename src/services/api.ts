// Replace with your machine's IP if testing on device (e.g., 'http://192.168.1.5:3000')
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const TOKEN_KEY = '@auth_token';

export interface PdfItem {
    id: string;
    filename: string;
    originalFilename: string;
    pageCount: number;
    extractedPages: number;
    unlockStatus: 'success' | 'failed' | 'pending';
    documentType: 'statement' | 'unknown' | string;
    fileSize: number;
    createdAt: string;
    newBalance?: number | null;
    statementDate?: string | null;
    dueDate?: string | null;
    analysisTime?: number | null;
}

export interface HistoryResponse {
    success: boolean;
    pdfs: PdfItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    error?: string;
}

export interface Transaction {
    date: string;
    description: string;
    amount: number;
    type: string;
    category: string;
    _id: string;
}

export interface StatementDetail {
    id: string;
    summary: {
        name: string;
        statementDate: string;
        dueDate: string;
        newBalance: number;
        minimumPayment: number;
        creditLimit: number;
    };
    transactions: Transaction[];
    analysisMetadata: {
        analyzedAt: string;
        processingTime: number;
        success: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export interface StatementResponse {
    success: boolean;
    statement: StatementDetail;
    error?: string;
}

// Helper to get auth headers
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const api = {
    /**
     * Get Analytics Data
     */
    getAnalytics: async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/analytics/aggregate`, {
                method: 'GET',
                headers,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // Return defaults if no statements found
                if (response.status === 404) {
                    return {
                        success: true,
                        analytics: {
                            summary: {
                                totalStatements: 0,
                                totalSpending: 0,
                                totalCredits: 0,
                                averageMonthlySpending: 0,
                                totalTransactions: 0,
                                mostUsedCategory: 'N/A',
                            },
                            monthlyTrends: [],
                            overallCategoryBreakdown: [],
                            topMerchantsAllTime: [],
                        }
                    };
                }
                throw new Error(data.error || 'Failed to fetch analytics');
            }

            return data;
        } catch (error) {
            console.error('❌ API: Analytics Error', error);
            throw error;
        }
    },

    /**
     * Sign in API call
     */
    signIn: async (email: string, password: string) => {
        console.log('📡 API: Sign In Request', { email });

        try {
            const response = await fetch(`${API_URL}/api/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            console.log('✅ API: Sign In Response - Success');
            return {
                success: true,
                token: data.token,
                user: data.user
            };
        } catch (error: any) {
            console.error('❌ API: Sign In Error', error);
            throw error;
        }
    },

    /**
     * Sign up API call
     */
    signUp: async (email: string, password: string) => {
        console.log('📡 API: Sign Up Request', { email });

        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // TODO: Add name field to UI if needed, currently using email prefix
                    name: email.split('@')[0],
                    email,
                    password,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            console.log('✅ API: Sign Up Response - Success');
            return {
                success: true,
                token: data.token,
                user: data.user
            };

        } catch (error: any) {
            // console.error('❌ API: Sign Up Error', error);
            throw error;
        }
    },

    /**
     * Get PDFs (History)
     */
    getPdfs: async (page = 1, limit = 10): Promise<HistoryResponse> => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/pdfs/with-statements?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch history');
            }

            return data as HistoryResponse;
        } catch (error) {
            console.error('❌ API: Get PDFs Error', error);
            throw error;
        }
    },

    /**
     * Upload PDF
     */
    uploadPdf: async (formData: FormData) => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            const response = await fetch(`${API_URL}/api/pdfs/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('❌ API: Upload Error', error);
            throw error;
        }
    },

    /**
     * Unlock PDF (Upload with Password)
     */
    unlockPdf: async (formData: FormData) => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            // Ensure we don't set Content-Type manually for FormData; fetch handles it
            const response = await fetch(`${API_URL}/api/unlock-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Unlock failed');
            }

            return data;
        } catch (error) {
            console.error('❌ API: Unlock PDF Error', error);
            throw error;
        }
    },

    /**
     * Get Passwords
     */
    getPasswords: async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/passwords`, {
                method: 'GET',
                headers,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to fetch passwords');
            return data;
        } catch (error) {
            console.error('❌ API: Get Passwords Error', error);
            throw error;
        }
    },

    /**
     * Create Password
     */
    createPassword: async (label: string, password: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/passwords`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ label, password }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to create password');
            return data;
        } catch (error) {
            console.error('❌ API: Create Password Error', error);
            throw error;
        }
    },

    /**
     * Delete Password
     */
    deletePassword: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/passwords/${id}`, {
                method: 'DELETE',
                headers,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to delete password');
            return data;
        } catch (error) {
            console.error('❌ API: Delete Password Error', error);
            throw error;
        }
    },

    /**
     * Get Password Details (Decrypted)
     * Assuming GET /api/passwords/:id returns the decrypted password
     */
    getPasswordDetails: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/passwords/${id}`, {
                method: 'GET',
                headers,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to fetch password details');
            return data;
        } catch (error) {
            console.error('❌ API: Get Password Details Error', error);
            throw error;
        }
    },
    /**
     * Analyze Statement (for 'unknown' document types)
     */
    analyzeStatement: async (pdfId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/statements/analyze`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ pdfId }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            return data;
        } catch (error) {
            console.error('❌ API: Analyze Statement Error', error);
            throw error;
        }
    },

    /**
     * Get Detailed Statement
     */
    getStatementDetails: async (id: string): Promise<StatementResponse> => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/api/statements/${id}`, {
                method: 'GET',
                headers,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch statement details');
            }

            return data as StatementResponse;
        } catch (error) {
            console.error('❌ API: Get Statement Details Error', error);
            throw error;
        }
    }
};
