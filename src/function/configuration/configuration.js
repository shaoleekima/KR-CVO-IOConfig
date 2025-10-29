// Function to load and display configurations

// Helper function to get original pin label from HTML
function getOriginalPinLabel(pinNumber) {
    // This function tries to get the original pin label from the terminal diagram
    if (window.parent && window.parent.document) {
        // If in iframe, try to access parent document
        const connector = window.parent.document.querySelector(`[data-number="${pinNumber}"]`);
        if (connector) {
            return connector.getAttribute('pin-lable') || connector.getAttribute('pin-label');
        }
    }
    
    // Try current document
    const connector = document.querySelector(`[data-number="${pinNumber}"]`);
    if (connector) {
        return connector.getAttribute('pin-lable') || connector.getAttribute('pin-label');
    }
    
    // Fallback - try VD1CC055 data if available
    if (window.VD1CC055_DATA && window.VD1CC055_DATA.pins) {
        const pinData = window.VD1CC055_DATA.pins.find(p => p.number == pinNumber);
        if (pinData) {
            return pinData.label;
        }
    }
    
    return null;
}

function loadConfigurations() {
    try {
        let configs = [];
        let summary = {};

        // Try to get data from global storage first
        if (window.getConfigurationData && typeof window.getConfigurationData === 'function') {
            configs = window.getConfigurationData();
            summary = window.getConfigurationSummary ? window.getConfigurationSummary() : {};
        } else {
            // Fallback: Load from localStorage directly
            configs = loadConfigurationsFromLocalStorage();
            summary = generateSummaryFromConfigs(configs);
        }
        
        displaySummary(summary);
        displayConfigurations(configs);
        
        console.log('Loaded configurations:', configs);
    } catch (error) {
        console.error('Error loading configurations:', error);
        displayError('Error loading configuration data: ' + error.message);
    }
}

// Make loadConfigurations available globally for other scripts to call
window.loadConfigurations = loadConfigurations();

// Fallback function to load configurations directly from localStorage
function loadConfigurationsFromLocalStorage() {
    const configs = [];
    
    console.log('🔄 Loading configurations from localStorage...');
    
    // Load from new data storage system first
    if (window.DataStorageManager) {
        console.log('✅ DataStorageManager found in configuration viewer');
        const savedConfigs = window.DataStorageManager.getAllSavedConfigurations();
        console.log('📊 Data storage configurations:', savedConfigs);
        
        // Convert DIO configurations to array format
        Object.keys(savedConfigs.DIO).forEach(pinNumber => {
            const config = savedConfigs.DIO[pinNumber];
            console.log(`🔧 Processing DIO config for pin ${pinNumber}:`, config);
            configs.push({
                pin: pinNumber,
                originalLabel: config.originalLabel || getOriginalPinLabel(pinNumber) || `Pin ${pinNumber}`,
                shortName: config.CustSpecName || config.custSpecName || config.shortName || config.originalLabel || getOriginalPinLabel(pinNumber) || `Pin ${pinNumber}`,
                outputType: 'DIO',
                timestamp: config.timestamp || new Date().toISOString(),
                configured: true,
                ...config
            });
        });
        
        // Convert PWM configurations to array format
        Object.keys(savedConfigs.PWM).forEach(pinNumber => {
            const config = savedConfigs.PWM[pinNumber];
            configs.push({
                pin: pinNumber,
                originalLabel: config.originalLabel || getOriginalPinLabel(pinNumber) || `Pin ${pinNumber}`,
                shortName: config.CustSpecName || config.custSpecName || config.shortName || config.originalLabel || getOriginalPinLabel(pinNumber) || `Pin ${pinNumber}`,
                outputType: 'PWM',
                timestamp: config.timestamp || new Date().toISOString(),
                configured: true,
                pwmFrequency: config.frequency || '1000',
                pwmDutyCycle: config.dutyCycle || '50',
                ...config
            });
        });
        
        if (configs.length > 0) {
            console.log('Found configurations from data storage:', configs.length);
            return configs;
        }
    }
    
    // Fallback to legacy array storage
    try {
        const arrayData = localStorage.getItem('pin_configurations_array');
        console.log('Array data from localStorage:', arrayData);
        if (arrayData) {
            const parsedArray = JSON.parse(arrayData);
            if (Array.isArray(parsedArray)) {
                console.log('Found array configurations:', parsedArray.length);
                return parsedArray;
            }
        }
    } catch (error) {
        console.warn('Error loading from array storage:', error);
    }
    
    // Fallback to legacy individual storage
    console.log('Falling back to legacy storage...');
    const keys = Object.keys(localStorage);
    const pinKeys = keys.filter(key => key.startsWith('pin_config_'));
    console.log('Found legacy pin keys:', pinKeys);
    
    pinKeys.forEach(key => {
        try {
            const config = JSON.parse(localStorage.getItem(key));
            if (config) {
                configs.push(config);
            }
        } catch (error) {
            console.warn('Error parsing config for key:', key, error);
        }
    });
    
    console.log('Loaded configurations from localStorage:', configs);
    return configs;
}

// Generate summary from configuration array
function generateSummaryFromConfigs(configs) {
    const summary = {
        total: configs.length,
        byType: {},
        configured: configs.filter(c => c.configured).length,
        lastUpdated: configs.length > 0 ? 
            Math.max(...configs.map(c => new Date(c.timestamp).getTime())) : null
    };
    
    // Count by output type
    configs.forEach(config => {
        const type = config.outputType || 'Unknown';
        summary.byType[type] = (summary.byType[type] || 0) + 1;
    });
    
    return summary;
}

function displaySummary(summary) {
    console.log('📊 Displaying summary statistics:', summary);
    const summaryContainer = document.getElementById('summary-stats');
    
    if (!summary || summary.total === 0) {
        console.log('⚠️ No summary data to display');
        summaryContainer.innerHTML = '<div class="no-data">No configuration data available</div>';
        return;
    }

    let summaryHTML = `
        <div class="stat-card">
            <div class="stat-value">${summary.total || 0}</div>
            <div class="stat-label">Total Pins</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${summary.byType.PWM || 0}</div>
            <div class="stat-label">PWM Pins</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${summary.byType.DIO || 0}</div>
            <div class="stat-label">DIO Pins</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${summary.configured || 0}</div>
            <div class="stat-label">Configured</div>
        </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
    console.log('✅ Summary statistics displayed successfully');
}

function displayConfigurations(configs) {
    const configContainer = document.getElementById('config-grid');
    
    if (!configs || configs.length === 0) {
        configContainer.innerHTML = '<div class="no-data">No pin configurations found.<br>Configure pins in the terminal diagram first.</div>';
        return;
    }

    let configHTML = '';
    console.log('🏗️ Building config HTML for', configs.length, 'configurations');
    
    configs.forEach((config, index) => {
        console.log(`📌 Processing config ${index + 1}:`, config);
        const configDate = new Date(config.timestamp).toLocaleString();
        const isPWM = config.outputType === 'PWM';
        
        configHTML += `
            <div class="config-card ${config.outputType.toLowerCase()}" data-config-index="${index}" onclick="selectConfiguration(${index})">
                <div class="pin-number">Pin ${config.pin}</div>
                <div class="short-name">${config.shortName}</div>
                <div style="font-weight: bold; color: ${isPWM ? '#ff9800' : '#4caf50'};">
                    ${config.outputType}
                </div>
                ${isPWM ? `
                    <div class="pwm-details">
                        <strong>PWM Settings:</strong><br>
                        Frequency: ${config.pwmFrequency} Hz<br>
                        Duty Cycle: ${config.pwmDutyCycle}%
                    </div>
                ` : ''}
                <div class="details">
                    Original Label: ${config.originalLabel}<br>
                    Configured: ${configDate}
                </div>
            </div>
        `;
    });
    
    console.log('✅ Config HTML built, length:', configHTML.length);

    configContainer.innerHTML = configHTML;
    
    // Store configurations globally for access
    window.currentConfigurations = configs;
}

function displayError(message) {
    const configContainer = document.getElementById('config-grid');
    const summaryContainer = document.getElementById('summary-stats');
    
    configContainer.innerHTML = `<div class="no-data" style="color: #dc3545;">${message}</div>`;
    summaryContainer.innerHTML = `<div class="no-data" style="color: #dc3545;">Unable to load summary</div>`;
}

function exportData() {
    try {
        if (window.DataStorageManager) {
            // Export using the data storage manager
            const success = window.DataStorageManager.downloadConfigData();
            if (success) {
                console.log('Configuration data exported using DataStorageManager');
            } else {
                throw new Error('Failed to export data using DataStorageManager');
            }
        } else {
            // Fallback: use legacy export method
            if (window.exportConfigurationData && typeof window.exportConfigurationData === 'function') {
                const data = window.exportConfigurationData();
                console.log('Configuration data exported using legacy method');
            } else {
                alert('Export function not available. Please configure pins first.');
            }
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data: ' + error.message);
    }
}

function exportCSV() {
    try {
        let csvData = 'Pin,Original Label,Custom Name,Output Type,Direction,Connected To,Frequency,Duty Cycle,Timestamp\n';
        
        if (window.DataStorageManager) {
            const savedConfigs = window.DataStorageManager.getAllSavedConfigurations();
            
            // Export DIO configurations
            Object.keys(savedConfigs.DIO).forEach(pinNumber => {
                const config = savedConfigs.DIO[pinNumber];
                csvData += `${pinNumber},"${config.originalLabel || ''}","${config.custSpecName || ''}","DIO","${config.direction || ''}","${config.connectedTo || ''}","","","${config.timestamp || ''}"\n`;
            });
            
            // Export PWM configurations
            Object.keys(savedConfigs.PWM).forEach(pinNumber => {
                const config = savedConfigs.PWM[pinNumber];
                csvData += `${pinNumber},"${config.originalLabel || ''}","${config.custSpecName || ''}","PWM","","${config.connectedTo || ''}","${config.frequency || ''}","${config.dutyCycle || ''}","${config.timestamp || ''}"\n`;
            });
        } else if (window.currentConfigurations) {
            // Fallback to current configurations
            window.currentConfigurations.forEach(config => {
                const frequency = config.outputType === 'PWM' ? (config.pwmFrequency || config.frequency || '') : '';
                const dutyCycle = config.outputType === 'PWM' ? (config.pwmDutyCycle || config.dutyCycle || '') : '';
                const direction = config.outputType === 'DIO' ? (config.direction || '') : '';
                
                csvData += `${config.pin},"${config.originalLabel || ''}","${config.shortName || ''}","${config.outputType}","${direction}","${config.connectedTo || ''}","${frequency}","${dutyCycle}","${config.timestamp || ''}"\n`;
            });
        }
        
        if (csvData === 'Pin,Original Label,Custom Name,Output Type,Direction,Connected To,Frequency,Duty Cycle,Timestamp\n') {
            alert('No configuration data to export');
            return;
        }
        
        // Create downloadable CSV file
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pin_configurations_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('CSV data exported');
    } catch (error) {
        console.error('CSV export error:', error);
        alert('Error exporting CSV: ' + error.message);
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all configuration data? This action cannot be undone.')) {
        try {
            // Clear from new data storage system
            if (window.DataStorageManager) {
                window.DataStorageManager.clearAllSavedConfigurations();
            }
            
            // Clear from localStorage directly (legacy support)
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('pin_config_') || key === 'pin_configurations_array' || key === 'kr_cvo_config_data') {
                    localStorage.removeItem(key);
                }
            });
            
            // Clear from global manager if available
            if (window.clearAllStoredConfigurations) {
                window.clearAllStoredConfigurations();
            }
            
            // Refresh display
            loadConfigurations();
            
            alert('All configuration data has been cleared.');
            console.log('All configuration data cleared');
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Error clearing data: ' + error.message);
        }
    }
}

// Function to select a configuration and show advanced settings
function selectConfiguration(configIndex) {
    const config = window.currentConfigurations[configIndex];
    if (!config) return;
    
    // Remove previous selection
    document.querySelectorAll('.config-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-config-index="${configIndex}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Show sidebar and populate advanced settings
    showAdvancedSettings(config);
}

// Function to show advanced settings in sidebar
function showAdvancedSettings(config) {
    const sidebar = document.getElementById('advanced-settings-sidebar');
    const content = document.getElementById('advanced-settings-content');
    
    // Reset any previous states
    sidebar.classList.remove('closing');
    sidebar.style.display = 'block';
    
    // Show sidebar with animation
    sidebar.classList.add('active');
    
    // Populate content based on config type
    if (config.outputType === 'DIO') {
        content.innerHTML = generateSideBarDio(config);
    } else if (config.outputType === 'PWM') {
        content.innerHTML = generateSideBarPWM(config);
    } else if (config.outputType === 'SENT') {
        content.innerHTML = generateSideBarSENT(config);
    } else if (config.outputType === 'Analog') {
        content.innerHTML = generateSideBarAnalog(config);
    } else if (config.outputType === 'Digital') {
        content.innerHTML = generateSideBarDigital(config);
    }
    
    // Initialize collapsible functionality
    initializeCollapsibles();
}

// Function to close advanced settings sidebar
function closeAdvancedSettings() {
    const sidebar = document.getElementById('advanced-settings-sidebar');
    
    // Add closing animation class
    sidebar.classList.add('closing');
    sidebar.classList.remove('active');
    
    // Hide sidebar after animation completes
    setTimeout(() => {
        sidebar.classList.remove('closing');
        sidebar.style.display = 'none';
    }, 300); // Match animation duration
    
    // Remove selection from all cards
    document.querySelectorAll('.config-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Function to initialize collapsible functionality
function initializeCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            
            if (content) {
                content.classList.toggle('collapsed');
                this.classList.toggle('collapsed');
            }
        });
    });
}

// Advanced settings action functions
function saveAdvancedConfig(pinNumber) {
    try {
        // Get the selected configuration
        const selectedCard = document.querySelector('.config-card.selected');
        if (!selectedCard) {
            alert('Please select a configuration first');
            return;
        }

        const configIndex = selectedCard.getAttribute('data-config-index');
        const config = window.currentConfigurations[configIndex];
        if (!config) {
            alert('Configuration not found');
            return;
        }

        let formData;
        let saveResult;

        // Collect form data based on configuration type
        if (config.outputType === 'DIO') {
            formData = collectDIOFormData();
            saveResult = window.DataStorageManager.saveDIOConfiguration(pinNumber, formData);
        } else if (config.outputType === 'PWM') {
            formData = collectPWMFormData();
            saveResult = window.DataStorageManager.savePWMConfiguration(pinNumber, formData);
        } else {
            alert('Unsupported configuration type: ' + config.outputType);
            return;
        }

        if (saveResult) {
            alert(`${config.outputType} configuration saved successfully for Pin ${pinNumber}!`);
            
            // Update localStorage array for compatibility
            const arrayData = localStorage.getItem('pin_configurations_array');
            let configurations = arrayData ? JSON.parse(arrayData) : [];
            
            // Update or add configuration
            const existingIndex = configurations.findIndex(c => c.pin == pinNumber);
            const updatedConfig = {
                ...config,
                ...formData,
                timestamp: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
                configurations[existingIndex] = updatedConfig;
            } else {
                configurations.push(updatedConfig);
            }
            
            localStorage.setItem('pin_configurations_array', JSON.stringify(configurations));
            
            // Refresh the terminal diagram if function exists
            if (window.refreshTerminalDiagram) {
                window.refreshTerminalDiagram();
            }
            
            // Refresh the display
            loadConfigurations();
        } else {
            alert('Error saving configuration. Please try again.');
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('Error saving configuration: ' + error.message);
    }
}

function loadDefaultConfig() {
    try {
        // Get the sidebar content element
        const content = document.getElementById('advanced-settings-content');
        if (!content) return;

        // Check if we have a selected pin configuration
        const selectedCard = document.querySelector('.config-card.selected');
        if (!selectedCard) {
            alert('Please select a configuration first');
            return;
        }

        const configIndex = selectedCard.getAttribute('data-config-index');
        const config = window.currentConfigurations[configIndex];
        if (!config) return;

        let defaultConfig;

        // Load default values based on configuration type
        if (config.outputType === 'DIO') {
            defaultConfig = window.DataStorageManager.loadDIODefaults();
            
            // Apply default DIO values
            document.getElementById('rba_IoSigDio_0CustSpecName').value = defaultConfig.custSpecName || config.originalLabel;
            document.getElementById('dio-direction').value = defaultConfig.direction || 'Output';
            document.getElementById('rba_IoSigDio_1ConnectedTo').value = defaultConfig.connectedTo || VD1CC055.getIcByPin(config.pin);
            document.getElementById('rba_IoSigDio_1DirectionChangeable').value = defaultConfig.directionChangeable || 'FALSE';
            document.getElementById('rba_IoSigDio_1Invert').value = defaultConfig.invert || 'FALSE';
            document.getElementById('rba_IoSigDio_CalibAlterText').value = defaultConfig.calibAlterText || '';
            document.getElementById('rba_IoSigDio_Calibratable').value = defaultConfig.calibratable || 'FALSE';
            document.getElementById('rba_IoSigDio_CalibratableInvert').value = defaultConfig.calibratableInvert || 'FALSE';
            document.getElementById('rba_IoSigDio_InitState').value = defaultConfig.initState || 'Idle';
            document.getElementById('rba_IoSigDio_InitStrategy').value = defaultConfig.initStrategy || 'AnyReset';
            document.getElementById('rba_IoSigDio_OutDiagCurrent').value = defaultConfig.outDiagCurrent || 'FALSE';
            document.getElementById('rba_IoSigDio_OutProtectStrategy').value = defaultConfig.outProtectStrategy || 'SwitchOff';
            
        } else if (config.outputType === 'PWM') {
            defaultConfig = window.DataStorageManager.loadPWMDefaults();
            
            // Apply default PWM values
            document.getElementById('pwm-custSpecName').value = defaultConfig.custSpecName || config.originalLabel;
            document.getElementById('pwm-frequency').value = defaultConfig.frequency || '1000';
            document.getElementById('pwm-dutyCycle').value = defaultConfig.dutyCycle || '50';
            document.getElementById('pwm-period').value = defaultConfig.period || 'variable';
            document.getElementById('pwm-polarity').value = defaultConfig.polarity || 'normal';
            document.getElementById('pwm-overload').value = defaultConfig.overload || 'enabled';
            document.getElementById('pwm-diagnostics').value = defaultConfig.diagnostics || 'full';
        }

        alert(`Default ${config.outputType} configuration loaded from stored defaults`);
        console.log('Default configuration loaded for', config.outputType, 'pin', config.pin, defaultConfig);
        
    } catch (error) {
        console.error('Error loading default configuration:', error);
        alert('Error loading default configuration: ' + error.message);
    }
}

function validateConfig() {
    alert('Configuration validated successfully');
    // TODO: Implement validation logic
}

function collectPWMFormData() {
    const config = {};
    
    // Basic Configuration
    config.custSpecName = document.getElementById('pwm-custSpecName')?.value || '';
    config.frequency = document.getElementById('pwm-frequency')?.value || '';
    config.dutyCycle = document.getElementById('pwm-dutyCycle')?.value || '';
    config.period = document.getElementById('pwm-period')?.value || '';
    config.polarity = document.getElementById('pwm-polarity')?.value || '';
    config.overload = document.getElementById('pwm-overload')?.value || '';
    config.diagnostics = document.getElementById('pwm-diagnostics')?.value || '';
    config.connectedTo = document.getElementById('pwm-connectedTo')?.value || '';
    config.calibratable = document.getElementById('pwm-calibratable')?.value || '';
    config.calibAlterText = document.getElementById('pwm-calibAlterText')?.value || '';
    config.initState = document.getElementById('pwm-initState')?.value || '';
    config.initStrategy = document.getElementById('pwm-initStrategy')?.value || '';
    
    return config;
}

function collectDIOFormData() {
    const config = {};
    
    // Basic Configuration
    config.connectedTo = document.getElementById('rba_IoSigDio_1ConnectedTo')?.value || '';
    config.direction = document.getElementById('dio-direction')?.value || '';
    config.custSpecName = document.getElementById('rba_IoSigDio_0CustSpecName')?.value || '';
    
    // Direction & Signal Control
    config.directionChangeable = document.getElementById('rba_IoSigDio_1DirectionChangeable')?.value || '';
    config.invert = document.getElementById('rba_IoSigDio_1Invert')?.value || '';
    config.calibAlterText = document.getElementById('rba_IoSigDio_CalibAlterText')?.value || '';
    
    // Calibration & Initialization
    config.calibratable = document.getElementById('rba_IoSigDio_Calibratable')?.value || '';
    config.calibratableInvert = document.getElementById('rba_IoSigDio_CalibratableInvert')?.value || '';
    config.initState = document.getElementById('rba_IoSigDio_InitState')?.value || '';
    
    // Advanced Settings
    config.initStrategy = document.getElementById('rba_IoSigDio_InitStrategy')?.value || '';
    config.outDiagCurrent = document.getElementById('rba_IoSigDio_OutDiagCurrent')?.value || '';
    config.outProtectStrategy = document.getElementById('rba_IoSigDio_OutProtectStrategy')?.value || '';
    
    return config;
}

function collectDIOFormLocalStorgate(){
    const config = {};

    for  (let i = 1; i < localStorage.length-1; i++){
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        config[i] = JSON.parse(value);
    }

    return config;
}

function exportARXML(pinNumber) {
    alert(`AUTOSAR XML exported for Pin ${pinNumber}`);
    // if (!validateDIOConfiguration()) return;
    
    const config = collectDIOFormData();
    //const urlParams = new URLSearchParams(window.location.search);
    //pinNumber = urlParams.get('pin');
    
    // Add pin number to config
    config.pinNumber = pinNumber;
    
    // Generate AUTOSAR XML for DIO using the template-based function
    const autosarXml = exportDIOToAutosar(config);
    
    // Download file
    const blob = new Blob([autosarXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TLE7244_DIO_Pin${pinNumber}_Config.arxml`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadConfigFromFile(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        alert('Please select a valid JSON file');
        return;
    }
    
    window.DataStorageManager.loadConfigFromFile(file)
        .then(data => {
            alert('Configuration file loaded successfully!');
            console.log('Loaded configuration data:', data);
            // Refresh the display
            loadConfigurations();
        })
        .catch(error => {
            console.error('Error loading config file:', error);
            alert('Error loading configuration file: ' + error.message);
        })
        .finally(() => {
            // Clear the file input
            input.value = '';
        });
}

// Function to clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all configuration data? This action cannot be undone.')) {
        try {
            // Clear from unified data storage system
            if (window.DataStorageManager) {
                window.DataStorageManager.clearAllSavedConfigurations();
            }
            
            // Clear from localStorage directly (legacy)
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('pin_config_') || key === 'pin_configurations_array') {
                    localStorage.removeItem(key);
                }
            });
            
            // Clear from global manager if available
            if (window.clearAllStoredConfigurations) {
                window.clearAllStoredConfigurations();
            }
            
            // Clear from terminal diagram if available
            if (window.PinConfigurationManager) {
                window.PinConfigurationManager.clearAllConfigurations();
            }
            
            // Refresh displays
            loadConfigurations();
            
            // Try to refresh terminal diagram if it's available
            if (window.refreshTerminalDiagram) {
                window.refreshTerminalDiagram();
            }
            
            alert('All configuration data has been cleared.');
            console.log('All configuration data cleared from all systems');
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Error clearing data: ' + error.message);
        }
    }
}

// Load configurations when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Config viewer loaded, attempting to load configurations...');
    loadConfigurations();
    
    // Auto-refresh every 5 seconds to catch updates
    setInterval(() => {
        console.log('Auto-refreshing configurations...');
        loadConfigurations();
    }, 5000);
});

// Listen for storage changes (when configurations are updated in other tabs)
window.addEventListener('storage', function(e) {
    if (e.key === 'pin_configurations_array' || e.key && e.key.startsWith('pin_config_')) {
        console.log('Storage changed, reloading configurations...');
        setTimeout(loadConfigurations, 100); // Small delay to ensure data is written
    }
});

// Also listen for custom events if available
document.addEventListener('configurationUpdated', function(e) {
    console.log('Configuration updated event received');
    loadConfigurations();
});