/**
 * Utility function to replace template placeholders with actual values
 * @param {string} template - Template string with placeholders
 * @param {Object} data - Data object with replacement values
 * @returns {string} Template with placeholders replaced
 */
function replaceTemplatePlaceholders(template, data) {
    return template
        .replace(/{{SIGNAL_NAME}}/g, data.signalName || '')
        .replace(/{{CUST_SPEC_NAME}}/g, data.custSpecName || data.signalName || '')
        .replace(/{{CONNECTED_TO}}/g, data.onnectedTo || '')
        .replace(/{{EXT_CONNECTED_TO}}/g, data.extConnectedTo || '')
        .replace(/{{DIRECTION}}/g, data.direction || 'Output')
        .replace(/{{DIRECTION_CHANGEABLE}}/g, data.directionChangeable || 'false')
        .replace(/{{INVERT}}/g, data.invert || 'false')
        .replace(/{{CALIB_ALTER_TEXT}}/g, data.calibAlterText || '')
        .replace(/{{CALIBRATABLE}}/g, data.calibratable || 'false')
        .replace(/{{CALIBRATABLE_INVERT}}/g, data.calibratableInvert || 'false')
        .replace(/{{INIT_STATE}}/g, data.initState || 'Idle')
        .replace(/{{INIT_STRATEGY}}/g, data.initStrategy || 'AnyReset')
        .replace(/{{OUT_DIAG_CURRENT}}/g, data.outDiagCurrent || 'true')
        .replace(/{{OUT_PROTECT_STRATEGY_PARAM}}/g, data.outProtectStrategy || 'SwitchOff');
}

/**
 * Export DIO configuration to AUTOSAR XML format using templates
 * @param {Object} data - DIO configuration object
 * @returns {string} AUTOSAR XML string
 */
function exportToArxml(template, data) {
    const pinNumber = data.pinNumber || '404';
    const signalName = data.custSpecName || `Error${pinNumber}`;
    const outputType = data.configType || 'Error';
    
    // Prepare template data
    const templateData = { ...data, signalName };
    
    // Generate components using templates
    const signalContainer = replaceTemplatePlaceholders(outputType === 'DIO'?template.signalContainerDio:template.signalContainerPwm, templateData);
    const signalRequest = replaceTemplatePlaceholders(template.signalRequest, templateData);
    
    // Replace placeholders in main template
    return template.main
        .replace('{{SIGNAL_CONTAINERS}}', signalContainer)
        .replace('{{SIGNAL_REQUESTS}}', signalRequest);
}

/**
 * Create signal container XML using template
 * @param {Object} dioData - DIO configuration object
 * @param {string} signalName - Signal name
 * @returns {string} Signal container XML
 */
function createSignalContainer(template, dioData, signalName) {
    return replaceTemplatePlaceholders(template.signalContainer, { ...dioData, signalName });
}

/**
 * Create signal request XML using template
 * @param {Object} dioData - DIO configuration object
 * @param {string} signalName - Signal name
 * @returns {string} Signal request XML
 */
function createSignalRequest(template, dioData, signalName) {
    return replaceTemplatePlaceholders(template.signalRequest, { ...dioData, signalName });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        replaceTemplatePlaceholders,
        exportToArxml,
        createSignalContainer,
        createSignalRequest
    };
}

// Browser environment - functions are available globally
console.log('Export arxml configuration module loaded successfully');