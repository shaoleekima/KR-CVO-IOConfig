// StatusManager - manage status display text and styling
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

window.BSW = window.BSW || {};
window.BSW.StatusManager = StatusManager;
