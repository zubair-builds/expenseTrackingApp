/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: PKR)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'PKR'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format a date string to localized date
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};
