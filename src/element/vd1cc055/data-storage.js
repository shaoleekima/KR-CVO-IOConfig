/**
 * Data Storage Manager for KR-CVO-IOConfig
 * Handles loading and saving configuration data using localStorage and file downloads
 * No server required - works entirely in browser
 */

class DataStorageManager {
    constructor() {
        this.configKey = 'kr_cvo_config_data';
        this.initializeDefaults();
    }

    /**
     * Initialize default configuration data in localStorage if not exists
     */
    initializeDefaults() {
        const defaultData = {
            generalSettings: {
                lastUpdated: new Date().toISOString(),
                version: "1.0",
                autoSave: true,
                loadDefaultsOnStart: false
            },
            defaultConfigurations: {
                DIO: {
                    custSpecName: "",
                    direction: "Output",
                    connectedTo: "",
                    directionChangeable: "FALSE",
                    invert: "FALSE",
                    calibAlterText: "",
                    calibratable: "FALSE",
                    calibratableInvert: "FALSE",
                    initState: "Idle",
                    initStrategy: "AnyReset",
                    outDiagCurrent: "FALSE",
                    outProtectStrategy: "SwitchOff"
                },
                PWM: {
                    custSpecName: "",
                    frequency: "1000",
                    dutyCycle: "50",
                    period: "variable",
                    polarity: "normal",
                    overload: "enabled",
                    diagnostics: "full",
                    connectedTo: "",
                    calibratable: "FALSE",
                    calibAlterText: "",
                    initState: "Idle",
                    initStrategy: "AnyReset"
                }
            },
            savedConfigurations: {
                DIO: {},
                PWM: {}
            }
        };

        // Initialize if not exists
        if (!localStorage.getItem(this.configKey)) {
            localStorage.setItem(this.configKey, JSON.stringify(defaultData));
        }
    }

    /**
     * Get all configuration data from localStorage
     */
    getAllData() {
        try {
            const data = localStorage.getItem(this.configKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading configuration data:', error);
            return null;
        }
    }

    /**
     * Save all configuration data to localStorage
     */
    saveAllData(data) {
        try {
            data.generalSettings.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.configKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving configuration data:', error);
            return false;
        }
    }

    /**
     * Generate filename with output folder prefix for downloads
     * @param {string} baseFilename - The base filename without path
     * @returns {string} Filename prefixed with output/
     */
    generateOutputFilename(baseFilename) {
        // For browser downloads, we can't directly control the folder, but we can suggest it
        // The user will see "output/" prefix in the download name, suggesting they save to output folder
        return `output/${baseFilename}`;
    }

    /**
     * Download configuration data as JSON file
     */
    downloadConfigData(filename = null) {
        try {
            const data = this.getAllData();
            if (!data) return false;

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const defaultFilename = `kr_cvo_config_${new Date().toISOString().split('T')[0]}.json`;
            a.download = this.generateOutputFilename(filename || defaultFilename);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Configuration data downloaded to output folder');
            return true;
        } catch (error) {
            console.error('Error downloading configuration:', error);
            return false;
        }
    }

    /**
     * Load configuration data from uploaded JSON file
     */
    loadConfigFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.validateConfigData(data)) {
                        this.saveAllData(data);
                        console.log('✅ Configuration data saved successfully');
                        
                        // Trigger refresh of terminal diagram if function exists
                        if (window.refreshTerminalDiagram) {
                            console.log('🔄 Calling refreshTerminalDiagram...');
                            window.refreshTerminalDiagram();
                        } else {
                            console.warn('⚠️ refreshTerminalDiagram function not found');
                        }
                        
                        // Trigger refresh of configuration viewer if function exists
                        if (window.loadConfigurations) {
                            console.log('🔄 Calling loadConfigurations...');
                            setTimeout(() => {
                                window.loadConfigurations();
                            }, 100); // Small delay to ensure data is fully saved
                        } else {
                            console.warn('⚠️ loadConfigurations function not found');
                        }
                        
                        resolve(data);
                    } else {
                        reject(new Error('Invalid configuration file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    /**
     * Validate configuration data structure
     */
    validateConfigData(data) {
        return data && 
               data.generalSettings && 
               data.defaultConfigurations && 
               data.defaultConfigurations.DIO && 
               data.defaultConfigurations.PWM && 
               data.savedConfigurations;
    }

    /**
     * Load DIO default configuration
     */
    loadDIODefaults() {
        const data = this.getAllData();
        return data ? data.defaultConfigurations.DIO : this.getDefaultDIOConfig();
    }

    /**
     * Load PWM default configuration
     */
    loadPWMDefaults() {
        const data = this.getAllData();
        return data ? data.defaultConfigurations.PWM : this.getDefaultPWMConfig();
    }

    /**
     * Save DIO configuration for a specific pin
     */
    saveDIOConfiguration(pinNumber, config) {
        try {
            const data = this.getAllData();
            if (!data) return false;

            data.savedConfigurations.DIO[pinNumber] = {
                ...config,
                timestamp: new Date().toISOString(),
                pinNumber: pinNumber
            };

            return this.saveAllData(data);
        } catch (error) {
            console.error('Error saving DIO configuration:', error);
            return false;
        }
    }

    /**
     * Save PWM configuration for a specific pin
     */
    savePWMConfiguration(pinNumber, config) {
        try {
            const data = this.getAllData();
            if (!data) return false;

            data.savedConfigurations.PWM[pinNumber] = {
                ...config,
                timestamp: new Date().toISOString(),
                pinNumber: pinNumber
            };

            return this.saveAllData(data);
        } catch (error) {
            console.error('Error saving PWM configuration:', error);
            return false;
        }
    }

    /**
     * Load saved configuration for a specific pin
     */
    loadPinConfiguration(pinNumber, outputType) {
        const data = this.getAllData();
        if (!data) return null;

        return data.savedConfigurations[outputType] && 
               data.savedConfigurations[outputType][pinNumber] || null;
    }

    /**
     * Get all saved configurations
     */
    getAllSavedConfigurations() {
        const data = this.getAllData();
        return data ? data.savedConfigurations : { DIO: {}, PWM: {} };
    }

    /**
     * Clear all saved configurations (keep defaults)
     */
    clearAllSavedConfigurations() {
        const data = this.getAllData();
        if (data) {
            data.savedConfigurations = { DIO: {}, PWM: {} };
            const success = this.saveAllData(data);
            
            if (success) {
                // Trigger refresh of terminal diagram if function exists
                if (window.refreshTerminalDiagram) {
                    window.refreshTerminalDiagram();
                }
                
                // Trigger refresh of configuration viewer if function exists
                if (window.loadConfigurations) {
                    window.loadConfigurations();
                }
            }
            
            return success;
        }
        return false;
    }

    /**
     * Get default DIO configuration
     */
    getDefaultDIOConfig() {
        return {
            custSpecName: "",
            direction: "Output",
            connectedTo: "",
            directionChangeable: "FALSE",
            invert: "FALSE",
            calibAlterText: "",
            calibratable: "FALSE",
            calibratableInvert: "FALSE",
            initState: "Idle",
            initStrategy: "AnyReset",
            outDiagCurrent: "FALSE",
            outProtectStrategy: "SwitchOff"
        };
    }

    /**
     * Get default PWM configuration
     */
    getDefaultPWMConfig() {
        return {
            custSpecName: "",
            frequency: "1000",
            dutyCycle: "50",
            period: "variable",
            polarity: "normal",
            overload: "enabled",
            diagnostics: "full",
            connectedTo: "",
            calibratable: "FALSE",
            calibAlterText: "",
            initState: "Idle",
            initStrategy: "AnyReset"
        };
    }
}

// Create global instance
window.DataStorageManager = new DataStorageManager();