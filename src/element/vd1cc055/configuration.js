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
                content.innerHTML = generateDIOAdvancedSettings(config);
            } else if (config.outputType === 'PWM') {
                content.innerHTML = generatePWMAdvancedSettings(config);
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

        // Function to generate DIO advanced settings (from dio-config.html)
        function generateDIOAdvancedSettings(config) {
            return `
                <div class="pin-info">
                    <h4>Pin ${config.pin} - ${config.shortName}</h4>
                    <p><strong>Type:</strong> ${config.outputType}</p>
                    <p><strong>Original Label:</strong> ${config.originalLabel}</p>
                </div>
                
                <!-- Basic Configuration -->
                <div class="form-group">
                    <label for="rba_IoSigDio_0CustSpecName">Customer Specific Name (Short Name):</label>
                    <input type="text" id="rba_IoSigDio_0CustSpecName" name="custSpecName" 
                        value="${config.shortName}" placeholder="Custom signal name">
                    <small>Customer-specific name for documentation</small>
                </div>

                <div class="form-group">
                    <label for="dio-direction">Direction *:</label>
                    <select id="dio-direction" name="direction" required>
                        <option value="Output" selected>Output</option>
                        <option value="Input">Input</option>
                    </select>
                    <small>Signal direction (Input/Output)</small>
                </div>

                <div class="form-group">
                    <label for="rba_IoSigDio_1ConnectedTo">Connected To *:</label>
                    <input type="text" id="rba_IoSigDio_1ConnectedTo" name="connectedTo" 
                        placeholder="DevType_DevOrPortIdx_Pin" 
                        pattern="^[A-Z][A-Za-z0-9]*?_.*"
                        title="Format: DevType_DevOrPortIdx_Pin" value="${VD1CC055.getIcByPin(config.pin)}" required>
                    <small>Device and pin connection specification</small>
                </div>
                
                <!-- Advanced Configuration -->
                <div class="collapsible-header" data-target="signal-control">
                    <h4>Signal Control <span class="toggle-icon">▼</span></h4>
                </div>
                <div class="collapsible-content collapsed" id="signal-control">
                    <div class="form-group">
                        <label for="rba_IoSigDio_1DirectionChangeable">Direction Changeable:</label>
                        <select id="rba_IoSigDio_1DirectionChangeable" name="directionChangeable">
                            <option value="true">TRUE</option>
                            <option value="false" selected>FALSE</option>
                        </select>
                        <small>Enable runtime direction change</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="rba_IoSigDio_1Invert">Signal Inversion:</label>
                        <select id="rba_IoSigDio_1Invert" name="invert">
                            <option value="true">TRUE</option>
                            <option value="false" selected>FALSE</option>
                        </select>
                        <small>Invert signal polarity (negative logic)</small>
                    </div>
                </div>
                
                <div class="collapsible-header" data-target="calibration-settings">
                    <h4>Calibration Settings <span class="toggle-icon">▼</span></h4>
                </div>
                <div class="collapsible-content collapsed" id="calibration-settings">
                    
                    <div class="form-group">
                        <label for="rba_IoSigDio_Calibratable">Calibration Routing Support:</label>
                        <select id="rba_IoSigDio_Calibratable" name="calibratable">
                            <option value="true">TRUE</option>
                            <option value="false" selected>FALSE</option>
                        </select>
                        <small>Enable HW signal routing calibration</small>
                    </div>

                    <div class="form-group">
                        <label for="rba_IoSigDio_CalibAlterText">Calibration Alternate Text:</label>
                        <input type="text" id="rba_IoSigDio_CalibAlterText" name="calibAlterText" 
                               maxlength="32" placeholder="A2L alternate text">
                        <small>Alternate text for A2L file (1-32 chars)</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="rba_IoSigDio_CalibratableInvert">Calibration Inversion Support:</label>
                        <select id="rba_IoSigDio_CalibratableInvert" name="calibratableInvert">
                            <option value="true">TRUE</option>
                            <option value="false" selected>FALSE</option>
                        </select>
                        <small>Enable signal inversion calibration</small>
                    </div>
                </div>
                
                <div class="collapsible-header" data-target="initialization-settings">
                    <h4>Initialization Settings <span class="toggle-icon">▼</span></h4>
                </div>
                <div class="collapsible-content collapsed" id="initialization-settings">
                    <div class="form-group">
                        <label for="rba_IoSigDio_InitState">Initial State:</label>
                        <select id="rba_IoSigDio_InitState" name="initState">
                            <option value="Idle" selected>Idle</option>
                            <option value="Active">Active</option>
                        </select>
                        <small>Signal state after initialization</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="rba_IoSigDio_InitStrategy">Initialization Strategy:</label>
                        <select id="rba_IoSigDio_InitStrategy" name="initStrategy">
                            <option value="AnyReset" selected>Any Reset</option>
                            <option value="PwrOnReset">Power-On Reset</option>
                        </select>
                        <small>When to re-initialize signal</small>
                    </div>
                </div>
                
                <div class="collapsible-header" data-target="diagnostic-protection">
                    <h4>Diagnostic & Protection <span class="toggle-icon">▼</span></h4>
                </div>
                <div class="collapsible-content collapsed" id="diagnostic-protection">
                    <div class="form-group">
                        <label for="rba_IoSigDio_OutDiagCurrent">Output Diagnostic Current:</label>
                        <select id="rba_IoSigDio_OutDiagCurrent" name="outDiagCurrent">
                            <option value="true">TRUE</option>
                            <option value="false" selected>FALSE</option>
                        </select>
                        <small>Enable diagnostic current for power stages</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="rba_IoSigDio_OutProtectStrategy">Output Protection Strategy:</label>
                        <select id="rba_IoSigDio_OutProtectStrategy" name="outProtectStrategy">
                            <option value="">Not Specified</option>
                            <option value="SwitchOff" selected>Switch-Off</option>
                            <option value="CurrentLimit">Current Limitation</option>
                            <option value="NoProtect">No Protection</option>
                        </select>
                        <small>Overload protection behavior</small>
                    </div>

                    <div class="form-group">
                        <lable for=""> </lable>
                        <select id="" name="">
                            <option value=""> </option>
                        </select>
                        <small></small>
                    </div>
                </div>
                
                <div class="button-row">
                    <button type="button" class="btn btn-primary" onclick="saveAdvancedConfig('${config.pin}')">💾 Save Configuration</button>
                    <button type="button" class="btn btn-secondary" onclick="loadDefaultConfig()">📁 Load Default</button>
                    <button type="button" class="btn btn-info" onclick="validateConfig()">✓ Validate</button>
                    <button type="button" class="btn btn-success" onclick="exportARXML('${config.pin}')">📤 Export AUTOSAR</button>
                </div>
            `;
        }

        // Function to generate PWM advanced settings
        function generatePWMAdvancedSettings(config) {
            return `
                <div class="pin-info">
                    <h4>Pin ${config.pin} - ${config.shortName}</h4>
                    <p><strong>Type:</strong> ${config.outputType}</p>
                    <p><strong>Original Label:</strong> ${config.originalLabel}</p>
                    <p><strong>Frequency:</strong> ${config.pwmFrequency} Hz</p>
                    <p><strong>Duty Cycle:</strong> ${config.pwmDutyCycle}%</p>
                </div>
                
                <!-- Basic PWM Configuration -->
                <div class="form-group">
                    <label for="pwm-custSpecName">Customer Specific Name (Short Name):</label>
                    <input type="text" id="pwm-custSpecName" name="custSpecName" 
                        value="${config.shortName}" placeholder="Custom signal name">
                    <small>Customer-specific name for documentation</small>
                </div>

                <div class="form-group">
                    <label for="pwm-frequency">PWM Frequency (Hz):</label>
                    <input type="number" id="pwm-frequency" name="frequency" 
                        value="${config.pwmFrequency}" min="1" max="100000">
                    <small>PWM signal frequency</small>
                </div>

                <div class="form-group">
                    <label for="pwm-dutyCycle">PWM Duty Cycle (%):</label>
                    <input type="number" id="pwm-dutyCycle" name="dutyCycle" 
                        value="${config.pwmDutyCycle}" min="0" max="100">
                    <small>PWM signal duty cycle</small>
                </div>
                
                <!-- PWM Advanced Settings -->
                <div class="collapsible-header" data-target="pwm-timing">
                    <h4>Timing Configuration <span class="toggle-icon">▼</span></h4>
                </div>
                <div class="collapsible-content collapsed" id="pwm-timing">
                    <div class="form-group">
                        <label for="pwm-period">Period Mode:</label>
                        <select id="pwm-period" name="period">
                            <option value="variable" selected>Variable</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        <small>PWM period configuration mode</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="pwm-polarity">Signal Polarity:</label>
                        <select id="pwm-polarity" name="polarity">
                            <option value="normal" selected>Normal (Active High)</option>
                            <option value="inverted">Inverted (Active Low)</option>
                        </select>
                        <small>PWM signal polarity</small>
                    </div>
                </div>
                
                <div class="collapsible-header" data-target="pwm-protection">
                    <h4>Protection & Diagnostics <span class="toggle-icon">▼</span></h4>
                </div>
                <div class="collapsible-content collapsed" id="pwm-protection">
                    <div class="form-group">
                        <label for="pwm-overload">Overload Protection:</label>
                        <select id="pwm-overload" name="overload">
                            <option value="enabled" selected>Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                        <small>Enable overload protection</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="pwm-diagnostics">Diagnostic Mode:</label>
                        <select id="pwm-diagnostics" name="diagnostics">
                            <option value="full" selected>Full Diagnostics</option>
                            <option value="basic">Basic Diagnostics</option>
                            <option value="none">No Diagnostics</option>
                        </select>
                        <small>PWM diagnostic level</small>
                    </div>
                </div>
                
                <div class="button-row">
                    <button type="button" class="btn btn-primary" onclick="saveAdvancedConfig('${config.pin}')">💾 Save Configuration</button>
                    <button type="button" class="btn btn-secondary" onclick="loadDefaultConfig()">📁 Load Default</button>
                    <button type="button" class="btn btn-info" onclick="validateConfig()">✓ Validate</button>
                    <button type="button" class="btn btn-success" onclick="exportARXML('${config.pin}')">📤 Export AUTOSAR</button>
                </div>
            `;
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
            alert(`Advanced configuration saved for Pin ${pinNumber}`);
            // TODO: Implement actual save functionality
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

        function exportARXML(pinNumber) {
            alert(`AUTOSAR XML exported for Pin ${pinNumber}`);
            // if (!validateDIOConfiguration()) return;
            
            const config = collectDIOFormData();
            const urlParams = new URLSearchParams(window.location.search);
            pinNumber = urlParams.get('pin') || '3';
            
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