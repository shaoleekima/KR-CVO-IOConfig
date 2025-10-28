// ConfigValidator - validate AUTOSAR and pin configurations
class Validator {
    /**
     * Validate AUTOSAR signal configuration
     * @param {Object} config - Configuration object
     * @param {number} pinNumber - Pin number for context
     * @returns {Object} Validation result {isValid: boolean, errors: Array<string>}
     */
    static AutosarConfig(config, pinNumber) {
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
    static MultiplePinConfigs(configuredPins) {
        const allErrors = [];
        let hasErrors = false;

        for (const {pinNumber, config} of configuredPins) {
            const validation = this.AutosarConfig(config, pinNumber);
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

window.BSW = window.BSW || {};
window.BSW.ConfigValidator = Validator;
