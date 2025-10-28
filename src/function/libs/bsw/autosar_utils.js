// AutosarUtils - helpers to generate default names and pin configs
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

window.BSW = window.BSW || {};
window.BSW.AutosarUtils = AutosarUtils;
