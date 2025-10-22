/**
 * Security and Input Validation Utilities
 */
class SecurityUtils {
    /**
     * Sanitize HTML input to prevent XSS attacks
     * @param {string} input - Raw input string
     * @returns {string} Sanitized string
     */
    static sanitizeHTML(input) {
        if (typeof input !== 'string') {
            return '';
        }

        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Validate AUTOSAR configuration input
     * @param {Object} config - Configuration object
     * @returns {Object} Validation result
     */
    static validateAutosarConfig(config) {
        const errors = [];

        // Check required fields
        if (!config.shortName || typeof config.shortName !== 'string') {
            errors.push('Short name is required and must be a string');
        }

        // Validate short name format
        if (config.shortName && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(config.shortName)) {
            errors.push('Short name must start with a letter and contain only alphanumeric characters and underscores');
        }

        // Validate pin number
        if (config.pinNumber && (isNaN(config.pinNumber) || config.pinNumber < 1 || config.pinNumber > 24)) {
            errors.push('Pin number must be between 1 and 24');
        }

        // Validate direction
        const validDirections = ['IN', 'OUT', 'INOUT'];
        if (config.direction && !validDirections.includes(config.direction)) {
            errors.push('Direction must be one of: IN, OUT, INOUT');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate file upload
     * @param {File} file - File object
     * @param {Array} allowedTypes - Allowed MIME types
     * @param {number} maxSize - Maximum file size in bytes
     * @returns {Object} Validation result
     */
    static validateFileUpload(file, allowedTypes = ['.arxml', '.xml'], maxSize = 5 * 1024 * 1024) {
        const errors = [];

        if (!file) {
            errors.push('No file provided');
            return { isValid: false, errors };
        }

        // Check file size
        if (file.size > maxSize) {
            errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        }

        // Check file extension
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }

        // Check for suspicious file names
        if (/[<>:"/\\|?*]/.test(file.name)) {
            errors.push('File name contains invalid characters');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Rate limiting for API calls
     * @param {string} key - Unique key for rate limiting
     * @param {number} limit - Maximum calls per window
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} Whether the request is allowed
     */
    static checkRateLimit(key, limit = 100, windowMs = 60000) {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or create storage for this key
        if (!this.rateLimitStorage) {
            this.rateLimitStorage = new Map();
        }

        let requests = this.rateLimitStorage.get(key) || [];
        
        // Remove old requests outside the window
        requests = requests.filter(timestamp => timestamp > windowStart);

        // Check if limit exceeded
        if (requests.length >= limit) {
            return false;
        }

        // Add current request
        requests.push(now);
        this.rateLimitStorage.set(key, requests);

        return true;
    }

    /**
     * Generate CSRF token
     * @returns {string} CSRF token
     */
    static generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate CSRF token
     * @param {string} token - Token to validate
     * @param {string} sessionToken - Session token
     * @returns {boolean} Whether token is valid
     */
    static validateCSRFToken(token, sessionToken) {
        return token && sessionToken && token === sessionToken;
    }
}

// Add to BSW namespace
if (typeof window !== 'undefined') {
    window.BSW = window.BSW || {};
    window.BSW.SecurityUtils = SecurityUtils;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}