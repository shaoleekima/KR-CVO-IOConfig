// Function to load and display configurations

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

// Fallback function to load configurations directly from localStorage
function loadConfigurationsFromLocalStorage() {
    const configs = [];
    
    console.log('Loading configurations from localStorage...');
    
    // Load from new array storage
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
    const summaryContainer = document.getElementById('summary-stats');
    
    if (!summary || summary.total === 0) {
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
}

function displayConfigurations(configs) {
    const configContainer = document.getElementById('config-grid');
    
    if (!configs || configs.length === 0) {
        configContainer.innerHTML = '<div class="no-data">No pin configurations found.<br>Configure pins in the terminal diagram first.</div>';
        return;
    }

    let configHTML = '';
    configs.forEach((config, index) => {
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
        if (window.exportConfigurationData) {
            const data = window.exportConfigurationData();
            console.log('Configuration data exported');
        } else {
            alert('Export function not available. Please open terminal diagram first.');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data: ' + error.message);
    }
}

function exportCSV() {
    try {
        if (window.generateConfigurationForExport) {
            const csvData = window.generateConfigurationForExport('csv');
            
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
        } else {
            alert('CSV export function not available. Please open terminal diagram first.');
        }
    } catch (error) {
        console.error('CSV export error:', error);
        alert('Error exporting CSV: ' + error.message);
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all configuration data? This action cannot be undone.')) {
        try {
            // Clear from localStorage directly
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
    // alert(`Advanced configuration saved for Pin ${pinNumber}`);
    
    // const config = collectDIOFormData();
    // const urlParams = new URLSearchParams(window.location.search);
    // pinNumber = urlParams.get('pin');
    
    // if (pinNumber && config) {
    //     localStorage.setItem(`tle7244_dio_pin_${pinNumber}`, JSON.stringify(config));
    //     alert('DIO configuration saved successfully!');
    // }

    localStorage.setItem('pin_configurations_array', JSON.stringify(this.configurations));
}

function loadDefaultConfig() {
    alert('Default configuration loaded');
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

    // Load default values based on configuration type
    if (config.outputType === 'DIO') {
        // Default DIO values
        document.getElementById('rba_IoSigDio_0CustSpecName').value = config.originalLabel;
        document.getElementById('dio-direction').value = 'Output';
        document.getElementById('rba_IoSigDio_1ConnectedTo').value = VD1CC055.getIcByPin(config.pin);
        document.getElementById('rba_IoSigDio_1DirectionChangeable').value = 'FALSE';
        document.getElementById('rba_IoSigDio_1Invert').value = 'FALSE';
        document.getElementById('rba_IoSigDio_CalibAlterText').value = '';
        document.getElementById('rba_IoSigDio_Calibratable').value = 'FALSE';
        document.getElementById('rba_IoSigDio_CalibratableInvert').value = 'FALSE';
        document.getElementById('rba_IoSigDio_InitState').value = 'Idle';
        document.getElementById('rba_IoSigDio_InitStrategy').value = 'AnyReset';
        document.getElementById('rba_IoSigDio_OutDiagCurrent').value = 'FALSE';
        document.getElementById('rba_IoSigDio_OutProtectStrategy').value = 'SwitchOff';
    } else if (config.outputType === 'PWM') {
        // Default PWM values
        document.getElementById('pwm-custSpecName').value = config.originalLabel;
        document.getElementById('pwm-frequency').value = '1000';
        document.getElementById('pwm-dutyCycle').value = '50';
        document.getElementById('pwm-period').value = 'variable';
        document.getElementById('pwm-polarity').value = 'normal';
        document.getElementById('pwm-overload').value = 'enabled';
        document.getElementById('pwm-diagnostics').value = 'full';
    }

    console.log('Default configuration loaded for', config.outputType, 'pin', config.pin);
}

function validateConfig() {
    alert('Configuration validated successfully');
    // TODO: Implement validation logic
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

function exportAllData(){
    //alert(`AUTOSAR XML exported for Pin ${pinNumber}`);
    // if (!validateDIOConfiguration()) return;
    
    const config = collectDIOFormLocalStorgate();
    //const urlParams = new URLSearchParams(window.location.search);
    //pinNumber = urlParams.get('pin') || '3';
    
    // Add pin number to config
    //config.pinNumber = pinNumber;
    
    // Generate AUTOSAR XML for DIO using the template-based function
    const autosarXml = exportDIOToAutosar(config);
    
    // Download file
    const blob = new Blob([autosarXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TLE7244_DIO_All_Pin_Config.arxml`;
    a.click();
    URL.revokeObjectURL(url);
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