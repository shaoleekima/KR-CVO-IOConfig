/**
 * DIO Configuration Data Extraction Module
 * Extracts parameters from dio-config.html form elements
 */

/**
 * Main function to get DIO configuration data from the HTML form
 * @returns {Object} Object containing all DIO configuration parameters
 */
function diodata() {
    try {
        // Check if we're in a browser environment with DOM access
        if (typeof document === 'undefined') {
            console.warn('diodata(): DOM not available. Running in Node.js environment?');
            return getDefaultDIOData();
        }

        // Get all form elements from the DIO configuration form
        const formData = {
            // Basic Configuration
            connectedTo: getElementValue('dio-connectedTo'),
            direction: getElementValue('dio-direction'),
            custSpecName: getElementValue('dio-custSpecName'),
            
            // Direction & Signal Control
            directionChangeable: getElementValue('dio-directionChangeable'),
            invert: getElementValue('dio-invert'),
            calibAlterText: getElementValue('dio-calibAlterText'),
            
            // Calibration & Initialization
            calibratable: getElementValue('dio-calibratable'),
            calibratableInvert: getElementValue('dio-calibratableInvert'),
            initState: getElementValue('dio-initState'),
            
            // Advanced Settings
            initStrategy: getElementValue('dio-initStrategy'),
            outDiagCurrent: getElementValue('dio-outDiagCurrent'),
            outProtectStrategy: getElementValue('dio-outProtectStrategy')
        };

        // Get pin number from URL parameters if available
        const urlParams = new URLSearchParams(window.location.search);
        const pinNumber = urlParams.get('pin');
        if (pinNumber) {
            formData.pinNumber = pinNumber;
        }

        // Add metadata
        formData.timestamp = new Date().toISOString();
        formData.configType = 'DIO';
        formData.deviceType = 'TLE7244';

        // Validate critical parameters
        if (!formData.connectedTo) {
            console.warn('diodata(): Connected To parameter is missing');
        }
        if (!formData.direction) {
            console.warn('diodata(): Direction parameter is missing');
        }

        console.log('DIO data extracted successfully:', formData);
        return formData;

    } catch (error) {
        console.error('Error extracting DIO data:', error);
        return getDefaultDIOData();
    }
}

/**
 * Helper function to safely get element value by ID
 * @param {string} elementId - The ID of the element to get value from
 * @returns {string} The value of the element or empty string if not found
 */
function getElementValue(elementId) {
    try {
        const element = document.getElementById(elementId);
        if (element) {
            return element.value || '';
        } else {
            console.warn(`Element with ID '${elementId}' not found`);
            return '';
        }
    } catch (error) {
        console.error(`Error getting value for element '${elementId}':`, error);
        return '';
    }
}

/**
 * Get default DIO configuration data
 * Used as fallback when DOM is not available or form is not accessible
 * @param {string} pinNumber - Optional pin number
 * @returns {Object} Default DIO configuration object
 */
function getDefaultDIOData(pinNumber = '3') {
    return {
        // Basic Configuration
        connectedTo: `TLE7244_01_0${pinNumber}`,
        direction: 'Output',
        custSpecName: `DIO_Pin_${pinNumber}`,
        
        // Direction & Signal Control
        directionChangeable: 'false',
        invert: 'false',
        calibAlterText: `Pin${pinNumber}_DIO`,
        
        // Calibration & Initialization
        calibratable: 'false',
        calibratableInvert: 'false',
        initState: 'Idle',
        
        // Advanced Settings
        initStrategy: 'AnyReset',
        outDiagCurrent: 'true',
        outProtectStrategy: 'SwitchOff',
        
        // Metadata
        pinNumber: pinNumber,
        timestamp: new Date().toISOString(),
        configType: 'DIO',
        deviceType: 'TLE7244',
        isDefault: true
    };
}

/**
 * Get DIO configuration data for a specific pin
 * @param {string} pinNumber - The pin number to get configuration for
 * @returns {Object} DIO configuration object for the specified pin
 */
function getDIODataForPin(pinNumber) {
    // Try to get saved configuration from localStorage first
    if (typeof localStorage !== 'undefined') {
        try {
            const savedConfig = localStorage.getItem(`tle7244_dio_pin_${pinNumber}`);
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                parsedConfig.pinNumber = pinNumber;
                parsedConfig.timestamp = new Date().toISOString();
                parsedConfig.configType = 'DIO';
                parsedConfig.deviceType = 'TLE7244';
                console.log(`Loaded saved DIO configuration for pin ${pinNumber}`);
                return parsedConfig;
            }
        } catch (error) {
            console.error(`Error loading saved configuration for pin ${pinNumber}:`, error);
        }
    }
    
    // Fallback to default configuration
    return getDefaultDIOData(pinNumber);
}

/**
 * Validate DIO configuration data
 * @param {Object} dioData - DIO configuration object to validate
 * @returns {Object} Validation result with isValid flag and error messages
 */
function validateDIOData(dioData) {
    const errors = [];
    const warnings = [];

    // Required field validation
    if (!dioData.connectedTo) {
        errors.push('Connected To field is required');
    } else if (!/^[A-Z][A-Za-z0-9]*?_.*/.test(dioData.connectedTo)) {
        errors.push('Connected To field format is invalid. Expected format: DevType_DevOrPortIdx_Pin');
    }

    if (!dioData.direction) {
        errors.push('Direction field is required');
    } else if (!['Input', 'Output'].includes(dioData.direction)) {
        errors.push('Direction must be either "Input" or "Output"');
    }

    // Optional field validation
    if (dioData.calibAlterText && dioData.calibAlterText.length > 32) {
        warnings.push('Calibration Alternate Text should not exceed 32 characters');
    }

    // Logic validation
    if (dioData.direction === 'Input' && dioData.outDiagCurrent === 'true') {
        warnings.push('Output Diagnostic Current is not applicable for Input direction');
    }

    if (dioData.direction === 'Input' && dioData.outProtectStrategy) {
        warnings.push('Output Protection Strategy is not applicable for Input direction');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

/**
 * Template definitions for AUTOSAR XML generation
 */
const DIO_TEMPLATES = {
    main: `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://autosar.org/schema/r4.0 AUTOSAR_4-0-2.xsd">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>RB</SHORT-NAME>
      <AR-PACKAGES>
        <AR-PACKAGE>
          <SHORT-NAME>UBK</SHORT-NAME>
          <AR-PACKAGES>
            <AR-PACKAGE>
              <SHORT-NAME>Project</SHORT-NAME>
              <AR-PACKAGES>
                <AR-PACKAGE>
                  <SHORT-NAME>EcucModuleConfigurationValuess</SHORT-NAME>
                  <ELEMENTS>
                    <ECUC-MODULE-CONFIGURATION-VALUES>
                      <SHORT-NAME>rba_IoSigDio</SHORT-NAME>
                      <DEFINITION-REF DEST="ECUC-MODULE-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio</DEFINITION-REF>
                      <CONTAINERS>
                        <ECUC-CONTAINER-VALUE>
                          <SHORT-NAME>rba_IoSigDio_General</SHORT-NAME>
                          <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_General</DEFINITION-REF>
                          <PARAMETER-VALUES>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_General/rba_IoSigDio_DevErrorDetect</DEFINITION-REF>
                              <VALUE>true</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-TEXTUAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_General/rba_IoSigDio_RequestHandling</DEFINITION-REF>
                              <VALUE>Strict</VALUE>
                            </ECUC-TEXTUAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_General/rba_IoSigDio_ValidationInversion</DEFINITION-REF>
                              <VALUE>false</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_General/rba_IoSigDio_VersionInfoApi</DEFINITION-REF>
                              <VALUE>false</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                          </PARAMETER-VALUES>
                        </ECUC-CONTAINER-VALUE>
                        <ECUC-CONTAINER-VALUE>
                          <SHORT-NAME>rba_IoSigDio_ConfigSet</SHORT-NAME>
                          <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet</DEFINITION-REF>
                          <SUB-CONTAINERS>
                            {{SIGNAL_CONTAINERS}}
                          </SUB-CONTAINERS>
                        </ECUC-CONTAINER-VALUE>
                        {{SIGNAL_REQUESTS}}
                      </CONTAINERS>
                    </ECUC-MODULE-CONFIGURATION-VALUES>
                  </ELEMENTS>
                </AR-PACKAGE>
              </AR-PACKAGES>
            </AR-PACKAGE>
          </AR-PACKAGES>
        </AR-PACKAGE>
      </AR-PACKAGES>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`,

    signalContainer: `<ECUC-CONTAINER-VALUE>
                              <SHORT-NAME>{{SIGNAL_NAME}}</SHORT-NAME>
                              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal</DEFINITION-REF>
                              <PARAMETER-VALUES>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_0CustSpecName</DEFINITION-REF>
                                  <VALUE>{{CUST_SPEC_NAME}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_1ConnectedTo</DEFINITION-REF>
                                  <VALUE>{{CONNECTED_TO}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_1Direction</DEFINITION-REF>
                                  <VALUE>{{DIRECTION}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                                <ECUC-NUMERICAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_1DirectionChangeable</DEFINITION-REF>
                                  <VALUE>{{DIRECTION_CHANGEABLE}}</VALUE>
                                </ECUC-NUMERICAL-PARAM-VALUE>
                                <ECUC-NUMERICAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_1Invert</DEFINITION-REF>
                                  <VALUE>{{INVERT}}</VALUE>
                                </ECUC-NUMERICAL-PARAM-VALUE>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_CalibAlterText</DEFINITION-REF>
                                  <VALUE>{{CALIB_ALTER_TEXT}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                                <ECUC-NUMERICAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Calibratable</DEFINITION-REF>
                                  <VALUE>{{CALIBRATABLE}}</VALUE>
                                </ECUC-NUMERICAL-PARAM-VALUE>
                                <ECUC-NUMERICAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_CalibratableInvert</DEFINITION-REF>
                                  <VALUE>{{CALIBRATABLE_INVERT}}</VALUE>
                                </ECUC-NUMERICAL-PARAM-VALUE>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_InitState</DEFINITION-REF>
                                  <VALUE>{{INIT_STATE}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_InitStrategy</DEFINITION-REF>
                                  <VALUE>{{INIT_STRATEGY}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                                <ECUC-NUMERICAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_OutDiagCurrent</DEFINITION-REF>
                                  <VALUE>{{OUT_DIAG_CURRENT}}</VALUE>
                                </ECUC-NUMERICAL-PARAM-VALUE>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_OutProtectStrategy</DEFINITION-REF>
                                  <VALUE>{{OUT_PROTECT_STRATEGY_PARAM}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                              </PARAMETER-VALUES>
                              <SUB-CONTAINERS>
                                <ECUC-CONTAINER-VALUE>
                                  <SHORT-NAME>rba_IoSigDio_Diagnosis</SHORT-NAME>
                                  <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis</DEFINITION-REF>
                                  <PARAMETER-VALUES>
                                    <ECUC-TEXTUAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DiagMonitoredCompOther</DEFINITION-REF>
                                      <VALUE>_anystring_</VALUE>
                                    </ECUC-TEXTUAL-PARAM-VALUE>
                                    <ECUC-NUMERICAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DiagTestPulse</DEFINITION-REF>
                                      <VALUE>true</VALUE>
                                    </ECUC-NUMERICAL-PARAM-VALUE>
                                    <ECUC-NUMERICAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DiagTestPulseDurActive</DEFINITION-REF>
                                      <VALUE>250</VALUE>
                                    </ECUC-NUMERICAL-PARAM-VALUE>
                                    <ECUC-NUMERICAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DiagTestPulseDurIdle</DEFINITION-REF>
                                      <VALUE>379</VALUE>
                                    </ECUC-NUMERICAL-PARAM-VALUE>
                                    <ECUC-TEXTUAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DynCreate_RBA_IODIAGPS_OL</DEFINITION-REF>
                                      <VALUE>Disabled</VALUE>
                                    </ECUC-TEXTUAL-PARAM-VALUE>
                                    <ECUC-TEXTUAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DynCreate_RBA_IODIAGPS_OT</DEFINITION-REF>
                                      <VALUE>Disabled</VALUE>
                                    </ECUC-TEXTUAL-PARAM-VALUE>
                                    <ECUC-TEXTUAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DynCreate_RBA_IODIAGPS_SCB</DEFINITION-REF>
                                      <VALUE>Disabled</VALUE>
                                    </ECUC-TEXTUAL-PARAM-VALUE>
                                    <ECUC-TEXTUAL-PARAM-VALUE>
                                      <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_ConfigSet/rba_IoSigDio_Signal/rba_IoSigDio_Diagnosis/rba_IoSigDio_DynCreate_RBA_IODIAGPS_SCG</DEFINITION-REF>
                                      <VALUE>Disabled</VALUE>
                                    </ECUC-TEXTUAL-PARAM-VALUE>
                                  </PARAMETER-VALUES>
                                </ECUC-CONTAINER-VALUE>
                              </SUB-CONTAINERS>
                            </ECUC-CONTAINER-VALUE>`,

    signalRequest: `<ECUC-CONTAINER-VALUE>
                          <SHORT-NAME>{{SIGNAL_NAME}}</SHORT-NAME>
                          <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest</DEFINITION-REF>
                          <PARAMETER-VALUES>
                            <ECUC-TEXTUAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest/rba_IoSigDio_1Direction</DEFINITION-REF>
                              <VALUE>{{DIRECTION}}</VALUE>
                            </ECUC-TEXTUAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest/rba_IoSigDio_1DirectionChangeable</DEFINITION-REF>
                              <VALUE>{{DIRECTION_CHANGEABLE}}</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest/rba_IoSigDio_Calibratable</DEFINITION-REF>
                              <VALUE>{{CALIBRATABLE}}</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest/rba_IoSigDio_Diag</DEFINITION-REF>
                              <VALUE>{{OUT_DIAG_CURRENT}}</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-TEXTUAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest/rba_IoSigDio_InitState</DEFINITION-REF>
                              <VALUE>{{INIT_STATE}}</VALUE>
                            </ECUC-TEXTUAL-PARAM-VALUE>
                            <ECUC-TEXTUAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest/rba_IoSigDio_InitStrategy</DEFINITION-REF>
                              <VALUE>{{INIT_STRATEGY}}</VALUE>
                            </ECUC-TEXTUAL-PARAM-VALUE>
                            <ECUC-TEXTUAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/RB/RBA/rba_IoSigDio/EcucModuleDefs/rba_IoSigDio/rba_IoSigDio_SignalRequest/rba_IoSigDio_OutProtectStrategy</DEFINITION-REF>
                              <VALUE>{{OUT_PROTECT_STRATEGY_PARAM}}</VALUE>
                            </ECUC-TEXTUAL-PARAM-VALUE>
                          </PARAMETER-VALUES>
                        </ECUC-CONTAINER-VALUE>`
};

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
        .replace(/{{CONNECTED_TO}}/g, data.connectedTo || '')
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
 * @param {Object} dioData - DIO configuration object
 * @returns {string} AUTOSAR XML string
 */
function exportDIOToAutosar(dioData) {
    const pinNumber = dioData.pinNumber || '3';
    const signalName = dioData.custSpecName || `DIO_Pin_${pinNumber}`;
    
    // Prepare template data
    const templateData = { ...dioData, signalName };
    
    // Generate components using templates
    const signalContainer = replaceTemplatePlaceholders(DIO_TEMPLATES.signalContainer, templateData);
    const signalRequest = replaceTemplatePlaceholders(DIO_TEMPLATES.signalRequest, templateData);
    
    // Replace placeholders in main template
    return DIO_TEMPLATES.main
        .replace('{{SIGNAL_CONTAINERS}}', signalContainer)
        .replace('{{SIGNAL_REQUESTS}}', signalRequest);
}

/**
 * Create signal container XML using template
 * @param {Object} dioData - DIO configuration object
 * @param {string} signalName - Signal name
 * @returns {string} Signal container XML
 */
function createSignalContainer(dioData, signalName) {
    return replaceTemplatePlaceholders(DIO_TEMPLATES.signalContainer, { ...dioData, signalName });
}

/**
 * Create signal request XML using template
 * @param {Object} dioData - DIO configuration object
 * @param {string} signalName - Signal name
 * @returns {string} Signal request XML
 */
function createSignalRequest(dioData, signalName) {
    return replaceTemplatePlaceholders(DIO_TEMPLATES.signalRequest, { ...dioData, signalName });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        diodata,
        getDIODataForPin,
        getDefaultDIOData,
        validateDIOData,
        exportDIOToAutosar
    };
}

// Browser environment - functions are available globally
console.log('DIO configuration module loaded successfully');
