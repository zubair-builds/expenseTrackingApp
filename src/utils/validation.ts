/**
 * Validation utilities for user inputs
 */

import { MIN_PASSWORD_LENGTH, EMAIL_REGEX, ALLOWED_FILE_TYPES } from '../constants';

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and error message
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return { isValid: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
    }
    return { isValid: true };
};

/**
 * Validate email
 * @param email - Email to validate
 * @returns Object with validation result and error message
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }
    if (!isValidEmail(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
};

/**
 * Validate file size
 * @param sizeInBytes - File size in bytes
 * @param maxSizeInMB - Maximum allowed size in MB
 * @returns True if file size is valid
 */
export const isValidFileSize = (sizeInBytes: number, maxSizeInMB: number = 10): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
};

/**
 * Validate PDF file type
 * @param mimeType - File MIME type
 * @returns True if file is PDF
 */
export const isPdfFile = (mimeType: string): boolean => {
    return ALLOWED_FILE_TYPES.includes(mimeType);
};
