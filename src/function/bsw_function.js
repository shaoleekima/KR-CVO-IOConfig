// BSW (Basic Software) Utility Functions
// Common functions that can be reused across different automotive IC components

/**
 * Template Loading and Processing Utilities
 */
class TemplateManager {
    /**
     * Load template from server
     * @param {string} templatePath - Path to template file
     * @returns {Promise<string>} Template content
     */
    static async loadTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading template:', error);
            return null;
        }
    }

    /**
     * Replace placeholders in template with actual values
     * @param {string} template - Template content
     * @param {Object} replacements - Key-value pairs for replacement
     * @returns {string} Processed template
     */
    static replacePlaceholders(template, replacements) {
        let result = template;
        for (const [key, value] of Object.entries(replacements)) {
            const placeholder = `{{${key}}}`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, value || '');
        }
        return result;
    }

    /**
     * Load multiple templates in parallel
     * @param {Array<string>} templatePaths - Array of template paths
     * @returns {Promise<Array<string>>} Array of template contents
     */
    static async loadMultipleTemplates(templatePaths) {
        try {
            const templates = await Promise.all(
                templatePaths.map(path => this.loadTemplate(path))
            );
            return templates;
        } catch (error) {
            console.error('Error loading multiple templates:', error);
            return [];
        }
    }
}

/**
 * Configuration Validation Utilities
 */
class ConfigValidator {
    /**
     * Validate AUTOSAR signal configuration
     * @param {Object} config - Configuration object
     * @param {number} pinNumber - Pin number for context
     * @returns {Object} Validation result {isValid: boolean, errors: Array<string>}
     */
    static validateAutosarConfig(config, pinNumber) {
        const errors = [];

        // Validate mandatory fields
        if (!config.connectedTo?.trim()) {
            errors.push(`Pin ${pinNumber}: Connected To is required`);
        } else if (!/^[A-Z][A-Za-z0-9]*?_.*/.test(config.connectedTo)) {
            errors.push(`Pin ${pinNumber}: Connected To format should be DevType_DevOrPortIdx_Pin`);
        }

        if (!config.direction) {
            errors.push(`Pin ${pinNumber}: Direction is required`);
        }

        // Validate optional fields
        if (config.calibAlterText && config.calibAlterText.length > 32) {
            errors.push(`Pin ${pinNumber}: Calibration Alternate Text max 32 characters`);
        }

        if (config.custSpecName && !/^[A-Za-z][A-Za-z0-9_]*$/.test(config.custSpecName)) {
            errors.push(`Pin ${pinNumber}: Customer Specific Name must start with letter and contain only alphanumeric characters and underscores`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate multiple pin configurations
     * @param {Array} configuredPins - Array of {pinNumber, config} objects
     * @returns {Object} Validation result
     */
    static validateMultiplePinConfigs(configuredPins) {
        const allErrors = [];
        let hasErrors = false;

        for (const {pinNumber, config} of configuredPins) {
            const validation = this.validateAutosarConfig(config, pinNumber);
            if (!validation.isValid) {
                allErrors.push(...validation.errors);
                hasErrors = true;
            }
        }

        return {
            isValid: !hasErrors,
            errors: allErrors
        };
    }
}

/**
 * File Download Utilities
 */
class FileDownloader {
    /**
     * Download content as file
     * @param {string} content - File content
     * @param {string} fileName - File name
     * @param {string} mimeType - MIME type (default: text/plain)
     */
    static downloadFile(content, fileName, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Generate timestamped filename
     * @param {string} baseName - Base name without extension
     * @param {string} extension - File extension (with dot)
     * @returns {string} Timestamped filename
     */
    static generateTimestampedFileName(baseName, extension) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        return `${baseName}_${timestamp}${extension}`;
    }

    /**
     * Download AUTOSAR XML file
     * @param {string} xmlContent - XML content
     * @param {string|number} identifier - Pin number or identifier
     * @param {string} signalName - Signal name (optional)
     */
    static downloadAutosarFile(xmlContent, identifier, signalName = '') {
        let fileName;
        
        if (identifier === 'AllPins') {
            fileName = this.generateTimestampedFileName('rba_IoSigDio_EcucValues_AllPins', '.arxml');
        } else {
            const name = signalName || `Pin${identifier}`;
            fileName = `rba_IoSigDio_EcucValues_${name}_TLE7244.arxml`;
        }
        
        this.downloadFile(xmlContent, fileName, 'application/xml');
    }
}

/**
 * LocalStorage Management Utilities
 */
class StorageManager {
    /**
     * Save configuration to localStorage with error handling
     * @param {string} key - Storage key
     * @param {Object} data - Data to save
     * @returns {boolean} Success status
     */
    static saveToStorage(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.warn(`Failed to save to localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Load configuration from localStorage with error handling
     * @param {string} key - Storage key
     * @returns {Object|null} Loaded data or null
     */
    static loadFromStorage(key) {
        try {
            const jsonData = localStorage.getItem(key);
            return jsonData ? JSON.parse(jsonData) : null;
        } catch (error) {
            console.warn(`Failed to load from localStorage (${key}):`, error);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Failed to remove from localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Clear all items matching pattern
     * @param {string} pattern - Key pattern to match
     */
    static clearStorageByPattern(pattern) {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes(pattern)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.warn('Failed to clear localStorage by pattern:', error);
        }
    }
}

/**
 * String and DOM Utilities
 */
class DOMUtils {
    /**
     * Safely get element value
     * @param {string} elementId - Element ID
     * @param {string} defaultValue - Default value if element not found
     * @returns {string} Element value or default
     */
    static getElementValue(elementId, defaultValue = '') {
        const element = document.getElementById(elementId);
        return element ? element.value : defaultValue;
    }

    /**
     * Safely set element value
     * @param {string} elementId - Element ID
     * @param {string} value - Value to set
     * @returns {boolean} Success status
     */
    static setElementValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value || '';
            return true;
        }
        return false;
    }

    /**
     * Add debounced event listener
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     * @param {number} delay - Debounce delay in ms
     */
    static addDebouncedListener(element, event, callback, delay = 300) {
        let timeout;
        element.addEventListener(event, (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => callback(e), delay);
        });
    }
}

/**
 * AUTOSAR Specific Utilities
 */
class AutosarUtils {
    /**
     * Generate default signal name
     * @param {string} icType - IC type (e.g., 'TLE7244')
     * @param {number} pinNumber - Pin number
     * @returns {string} Default signal name
     */
    static generateDefaultSignalName(icType, pinNumber) {
        return `${icType}_Pin_${pinNumber}`;
    }

    /**
     * Generate default connected to value
     * @param {string} icType - IC type
     * @param {number} pinNumber - Pin number
     * @returns {string} Default connected to value
     */
    static generateDefaultConnectedTo(icType, pinNumber) {
        return `${icType}_${String(pinNumber).padStart(2, '0')}_01`;
    }

    /**
     * Generate calibration alternate text
     * @param {string} signalName - Signal name
     * @returns {string} Calibration alternate text
     */
    static generateCalibAlterText(signalName) {
        return `K80_${signalName}`;
    }

    /**
     * Get default configuration for a pin
     * @param {number} pinNumber - Pin number
     * @param {string} icType - IC type
     * @returns {Object} Default configuration
     */
    static getDefaultPinConfig(pinNumber, icType = 'TLE7244') {
        return {
            connectedTo: this.generateDefaultConnectedTo(icType, pinNumber),
            direction: 'Output',
            custSpecName: '',
            directionChangeable: false,
            invert: false,
            calibAlterText: '',
            calibratable: false,
            calibratableInvert: false,
            initState: 'Idle',
            initStrategy: 'AnyReset',
            outDiagCurrent: true,
            outProtectStrategy: ''
        };
    }
}

/**
 * Status and Notification Utilities
 */
class StatusManager {
    /**
     * Update status display with type-based styling
     * @param {HTMLElement} statusElement - Status display element
     * @param {string} message - Status message
     * @param {string} type - Status type (info, success, warning, error)
     * @param {number} autoCloseDelay - Auto-close delay in ms (0 = no auto-close)
     */
    static updateStatus(statusElement, message, type = 'info', autoCloseDelay = 5000) {
        if (!statusElement) return;
        
        statusElement.textContent = message;
        
        // Remove previous status classes
        statusElement.classList.remove('status-success', 'status-warning', 'status-error', 'status-info');
        
        // Add appropriate status class
        statusElement.classList.add(`status-${type}`);
        
        // Auto-clear status for non-error messages
        if (type !== 'error' && autoCloseDelay > 0) {
            setTimeout(() => {
                if (statusElement.textContent === message) {
                    statusElement.textContent = 'Ready';
                    statusElement.classList.remove('status-success', 'status-warning', 'status-error', 'status-info');
                    statusElement.classList.add('status-info');
                }
            }, autoCloseDelay);
        }
    }
}

// Export utilities for global access
window.BSW = {
    TemplateManager,
    ConfigValidator,
    FileDownloader,
    StorageManager,
    DOMUtils,
    AutosarUtils,
    StatusManager
};
