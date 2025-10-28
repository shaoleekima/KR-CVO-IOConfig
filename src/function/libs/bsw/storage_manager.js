// StorageManager - wrapper for localStorage operations with error handling
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

window.BSW = window.BSW || {};
window.BSW.StorageManager = StorageManager;
