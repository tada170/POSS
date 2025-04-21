/**
 * Validation utility functions
 */

/**
 * Validate that required fields are present
 * @param {Object} data - Data to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {Object} - Validation result with isValid and error properties
 */
function validateRequired(data, requiredFields) {
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        return {
            isValid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        };
    }
    
    return { isValid: true };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with isValid and error properties
 */
function validatePassword(password, options = {}) {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = true
    } = options;
    
    if (!password || password.length < minLength) {
        return {
            isValid: false,
            error: `Password must be at least ${minLength} characters long`
        };
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
        return {
            isValid: false,
            error: 'Password must contain at least one uppercase letter'
        };
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
        return {
            isValid: false,
            error: 'Password must contain at least one lowercase letter'
        };
    }
    
    if (requireNumbers && !/\d/.test(password)) {
        return {
            isValid: false,
            error: 'Password must contain at least one number'
        };
    }
    
    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
            isValid: false,
            error: 'Password must contain at least one special character'
        };
    }
    
    return { isValid: true };
}

/**
 * Validate numeric value
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with isValid and error properties
 */
function validateNumeric(value, options = {}) {
    const { min, max, isInteger = false } = options;
    
    // Check if value is a number
    if (isNaN(value) || value === null || value === '') {
        return {
            isValid: false,
            error: 'Value must be a number'
        };
    }
    
    const numValue = Number(value);
    
    // Check if value is an integer if required
    if (isInteger && !Number.isInteger(numValue)) {
        return {
            isValid: false,
            error: 'Value must be an integer'
        };
    }
    
    // Check minimum value if specified
    if (min !== undefined && numValue < min) {
        return {
            isValid: false,
            error: `Value must be at least ${min}`
        };
    }
    
    // Check maximum value if specified
    if (max !== undefined && numValue > max) {
        return {
            isValid: false,
            error: `Value must be at most ${max}`
        };
    }
    
    return { isValid: true };
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with isValid and error properties
 */
function validateStringLength(value, options = {}) {
    const { min = 0, max } = options;
    
    if (typeof value !== 'string') {
        return {
            isValid: false,
            error: 'Value must be a string'
        };
    }
    
    if (value.length < min) {
        return {
            isValid: false,
            error: `String must be at least ${min} characters long`
        };
    }
    
    if (max !== undefined && value.length > max) {
        return {
            isValid: false,
            error: `String must be at most ${max} characters long`
        };
    }
    
    return { isValid: true };
}

/**
 * Sanitize input to prevent SQL injection and XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }
    
    // Replace potentially dangerous characters
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;')
        .replace(/\\/g, '&#92;');
}

module.exports = {
    validateRequired,
    isValidEmail,
    validatePassword,
    validateNumeric,
    validateStringLength,
    sanitizeInput
};