// DOMUtils - small helpers for interacting with DOM elements safely
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

window.BSW = window.BSW || {};
window.BSW.DOMUtils = DOMUtils;
