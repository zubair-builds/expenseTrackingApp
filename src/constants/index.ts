/**
 * Application constants
 */

// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// File Upload
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = ['application/pdf'];

// Currency
export const DEFAULT_CURRENCY = 'PKR';

// Storage Keys
export const TOKEN_STORAGE_KEY = '@auth_token';

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
