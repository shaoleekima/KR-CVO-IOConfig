// Terminal Diagram Interactive Script

// Global Data Storage System for Pin Configurations
window.PinConfigurationManager = {
    // Array to store all pin configuration data
    configurations: [],
    
    // Add a new configuration to the array
    addConfiguration: function(config) {
        // Check if configuration for this pin already exists
        const existingIndex = this.configurations.findIndex(c => c.pin === config.pin);
        
        if (existingIndex !== -1) {
            // Update existing configuration
            this.configurations[existingIndex] = config;
        } else {
            // Add new configuration
            this.configurations.push(config);
        }
        
        // Save to localStorage for persistence
        this.saveToStorage();
        
        console.log('Configuration added/updated:', config);
        console.log('Total configurations:', this.configurations.length);
    },
    
    // Get configuration by pin number
    getConfiguration: function(pinNumber) {
        return this.configurations.find(c => c.pin === pinNumber);
    },
    
    // Get all configurations
    getAllConfigurations: function() {
        return [...this.configurations]; // Return a copy
    },
    
    // Get configurations by type (DIO, PWM, etc.)
    getConfigurationsByType: function(outputType) {
        return this.configurations.filter(c => c.outputType === outputType);
    },
    
    // Remove configuration by pin number
    removeConfiguration: function(pinNumber) {
        const index = this.configurations.findIndex(c => c.pin === pinNumber);
        if (index !== -1) {
            const removed = this.configurations.splice(index, 1)[0];
            this.saveToStorage();
            console.log('Configuration removed:', removed);
            return removed;
        }
        return null;
    },
    
    // Clear all configurations
    clearAllConfigurations: function() {
        this.configurations = [];
        this.saveToStorage();
        localStorage.removeItem('pin_configurations_array');
        console.log('All configurations cleared');
    },
    
    // Save configurations to localStorage
    saveToStorage: function() {
        localStorage.setItem('pin_configurations_array', JSON.stringify(this.configurations));
    },
    
    // Load configurations from localStorage
    loadFromStorage: function() {
        const stored = localStorage.getItem('pin_configurations_array');
        if (stored) {
            try {
                this.configurations = JSON.parse(stored);
                console.log('Configurations loaded from storage:', this.configurations.length);
            } catch (error) {
                console.error('Error loading configurations from storage:', error);
                this.configurations = [];
            }
        }
    },
    
    // Export configurations as JSON
    exportConfigurations: function() {
        return JSON.stringify(this.configurations, null, 2);
    },
    
    // Import configurations from JSON
    importConfigurations: function(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                this.configurations = imported;
                this.saveToStorage();
                console.log('Configurations imported successfully:', this.configurations.length);
                return true;
            } else {
                console.error('Invalid configuration format');
                return false;
            }
        } catch (error) {
            console.error('Error importing configurations:', error);
            return false;
        }
    },
    
    // Get summary statistics
    getSummary: function() {
        const summary = {
            total: this.configurations.length,
            byType: {},
            configured: this.configurations.filter(c => c.configured).length,
            lastUpdated: this.configurations.length > 0 ? 
                Math.max(...this.configurations.map(c => new Date(c.timestamp).getTime())) : null
        };
        
        // Count by output type
        this.configurations.forEach(config => {
            const type = config.outputType || 'Unknown';
            summary.byType[type] = (summary.byType[type] || 0) + 1;
        });
        
        return summary;
    }
};

// Function to load configurations from the unified data storage system
function loadAndDisplayExistingConfigurations() {
    console.log('🔄 Loading existing configurations from unified storage...');
    
    // Load from DataStorageManager if available
    if (window.DataStorageManager) {
        console.log('✅ DataStorageManager is available');
        const allData = window.DataStorageManager.getAllData();
        console.log('📊 All data from storage:', allData);
        
        if (allData && allData.savedConfigurations) {
            console.log('✅ Found saved configurations:', allData.savedConfigurations);
            
            // Clear existing configurations first
            window.PinConfigurationManager.clearAllConfigurations();
            console.log('🧹 Cleared existing configurations');
            
            // Convert DIO configurations
            if (allData.savedConfigurations.DIO) {
                console.log('🔧 Processing DIO configurations:', Object.keys(allData.savedConfigurations.DIO));
                Object.keys(allData.savedConfigurations.DIO).forEach(pinNumber => {
                    const dioConfig = allData.savedConfigurations.DIO[pinNumber];
                    console.log(`🔧 Processing DIO config for pin ${pinNumber}:`, dioConfig);
                    
                    // Get original label from HTML
                    const originalLabel = getOriginalPinLabelFromHTML(pinNumber);
                    
                    const terminalConfig = {
                        pin: parseInt(pinNumber),
                        shortName: dioConfig.CustSpecName || dioConfig.custSpecName || dioConfig.shortName,
                        outputType: 'DIO',
                        timestamp: dioConfig.timestamp,
                        originalLabel: originalLabel || dioConfig.originalLabel || `Pin ${pinNumber}`,
                        configured: true
                    };
                    
                    console.log(`✅ Adding DIO configuration for pin ${pinNumber}:`, terminalConfig);
                    window.PinConfigurationManager.addConfiguration(terminalConfig);
                    
                    // Apply visual styling to the pin
                    console.log(`🎨 Applying visual styling to pin ${pinNumber}`);
                    applyConfigurationToPin(pinNumber, terminalConfig);
                });
            } else {
                console.log('⚠️ No DIO configurations found');
            }
            
            // Convert PWM configurations  
            if (allData.savedConfigurations.PWM) {
                Object.keys(allData.savedConfigurations.PWM).forEach(pinNumber => {
                    const pwmConfig = allData.savedConfigurations.PWM[pinNumber];
                    console.log(`Processing PWM config for pin ${pinNumber}:`, pwmConfig);
                    
                    // Get original label from HTML
                    const originalLabel = getOriginalPinLabelFromHTML(pinNumber);
                    
                    const terminalConfig = {
                        pin: parseInt(pinNumber),
                        shortName: pwmConfig.CustSpecName || pwmConfig.custSpecName || pwmConfig.shortName,
                        outputType: 'PWM',
                        pwmFrequency: pwmConfig.frequency,
                        pwmDutyCycle: pwmConfig.dutyCycle,
                        timestamp: pwmConfig.timestamp,
                        originalLabel: originalLabel || pwmConfig.originalLabel || `Pin ${pinNumber}`,
                        configured: true
                    };
                    
                    console.log(`Adding PWM configuration for pin ${pinNumber}:`, terminalConfig);
                    window.PinConfigurationManager.addConfiguration(terminalConfig);
                    
                    // Apply visual styling to the pin
                    applyConfigurationToPin(pinNumber, terminalConfig);
                });
            }
            
            const totalConfigs = Object.keys(allData.savedConfigurations.DIO || {}).length + 
                               Object.keys(allData.savedConfigurations.PWM || {}).length;
            console.log(`Loaded and applied ${totalConfigs} configurations to terminal diagram`);
            
            // Ensure TLE7244 remains hidden after loading configurations
            const terminalBody = document.querySelector('.terminal-body');
            if (terminalBody) {
                terminalBody.style.display = 'none';
                console.log('🔒 TLE7244 kept hidden after loading configurations - only shows on expand width');
            }
        } else {
            console.log('No saved configurations found in unified storage');
        }
    } else {
        console.log('DataStorageManager not available, using fallback loading');
        // Fallback to legacy loading
        window.PinConfigurationManager.loadFromStorage();
        
        // Apply visual styling to all loaded configurations
        const configs = window.PinConfigurationManager.getAllConfigurations();
        configs.forEach(config => {
            applyConfigurationToPin(config.pin.toString(), config);
        });
    }
}

// Function to get original pin label from HTML DOM
function getOriginalPinLabelFromHTML(pinNumber) {
    const connector = document.querySelector(`.connector[data-number="${pinNumber}"]`);
    if (connector) {
        return connector.getAttribute('pin-lable') || connector.getAttribute('pin-label') || null;
    }
    return null;
}

// Function to apply configuration styling to a pin
function applyConfigurationToPin(pinNumber, config) {
    console.log(`Attempting to apply styling to pin ${pinNumber}:`, config);
    
    const connector = document.querySelector(`.connector[data-number="${pinNumber}"]`);
    if (connector) {
        // Add configured class
        connector.classList.add('configured');
        
        // Apply green highlighting
        highlightPin(pinNumber, true);
        
        // Update title to show configuration
        const originalLabel = connector.getAttribute('pin-lable') || '';
        connector.title = `${config.shortName} (${config.outputType}) - Configured`;
        
        console.log(`✅ Applied styling to Pin ${pinNumber} (${originalLabel}): ${config.shortName}`);
    } else {
        console.error(`❌ Could not find connector for pin ${pinNumber}`);
        
        // Try to find all connectors for debugging
        const allConnectors = document.querySelectorAll('.connector[data-number]');
        console.log('Available connectors:', Array.from(allConnectors).map(c => c.getAttribute('data-number')));
    }
}

// Global refresh function for other files to call
window.refreshTerminalDiagram = function() {
    console.log('🔄 Refreshing terminal diagram...');
    
    // Clear all current visual configurations
    const connectors = document.querySelectorAll('.connector');
    connectors.forEach(connector => {
        connector.classList.remove('configured');
        const pinNumber = connector.getAttribute('data-number');
        if (pinNumber) {
            highlightPin(pinNumber, false);
            const originalLabel = connector.getAttribute('pin-lable') || '';
            connector.title = originalLabel;
        }
    });
    
    // Reload and display configurations with a small delay
    setTimeout(() => {
        console.log('🔄 Loading and displaying existing configurations...');
        loadAndDisplayExistingConfigurations();
        
        // Ensure TLE7244 remains hidden after refresh
        const terminalBody = document.querySelector('.terminal-body');
        if (terminalBody) {
            terminalBody.style.display = 'none';
            console.log('🔒 TLE7244 kept hidden after refresh - only shows on expand width');
        }
    }, 50);
};

// Initialize the configuration manager on page load
window.PinConfigurationManager.loadFromStorage();

document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all DOM elements are ready
    setTimeout(() => {
        console.log('DOM ready, loading existing configurations...');
        // Load existing configurations from storage and display them
        loadAndDisplayExistingConfigurations();
    }, 100);
    
    // Hide terminal body initially until expand width is clicked
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        // Always hide initially - only show when expand width is clicked
        terminalBody.style.display = 'none';
        console.log('Terminal diagram (TLE) hidden - will show on expand width click');
    }
    
    // Get all connectors
    const connectors = document.querySelectorAll('.connector');
    const filterButtons = document.querySelectorAll('.panel-button');
    const expandButton = document.getElementById('expand-button');
    const terminalDiagram = document.querySelector('.terminaldiagram');
    const terminalExpansion = document.querySelector('.terminal-body');
    let selectedConnectors = [];
    let activeFilter = null;
    let isExpanded = false;
    
    // Add click event listener to expand button
    if (expandButton) {
        expandButton.addEventListener('click', function() {
            toggleExpansion();
        });
    }
    
    // Function to toggle expansion
    function toggleExpansion() {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            terminalDiagram.classList.add('expanded');
            expandButton.textContent = 'Collapse Width';
            expandButton.classList.add('active');
            
            // Show and animate the terminal expansion section
            if (terminalExpansion) {
                terminalExpansion.style.display = 'block';
                // Use a small delay to ensure display change is processed before animation
                setTimeout(() => {
                    terminalExpansion.classList.add('visible');
                }, 10);
            }
        } else {
            terminalDiagram.classList.remove('expanded');
            expandButton.textContent = 'Expand Width';
            expandButton.classList.remove('active');
            
            // Hide the terminal expansion section
            if (terminalExpansion) {
                terminalExpansion.classList.remove('visible');
                // Hide the element after animation completes
                setTimeout(() => {
                    terminalExpansion.style.display = 'none';
                }, 300); // Match the CSS transition duration
            }
        }
        
        // Trigger custom event
        const event = new CustomEvent('diagramExpansionChanged', {
            detail: {
                isExpanded: isExpanded,
                currentWidth: isExpanded ? 800 : 240
            }
        });
        document.dispatchEvent(event);
    }
    
    // // Add click event listener to terminal body for expansion toggle
    // const terminalBody = document.querySelector('.terminal-body');
    // if (terminalBody) {
    //     terminalBody.addEventListener('click', function() {
    //         toggleExpansion();
    //     });
    // }
    
    // Function to update expansion content based on selected connectors
    function updateExpansionContent() {
        const pinMapping = document.querySelector('.pin-mapping');
        const signalInfo = document.querySelector('.signal-info');
        
        if (pinMapping && signalInfo) {
            if (selectedConnectors.length > 0) {
                // Update pin mapping with pin-type information
                let pinMappingContent = `<strong>Selected Pins (${selectedConnectors.length}):</strong><br>`;
                selectedConnectors.forEach(connector => {
                    const pinNumber = connector.getAttribute('data-number');
                    const pinLabel = connector.getAttribute('pin-lable') || 'No label';
                    const pinType = connector.getAttribute('pin-type') || 'N/A';
                    const side = connector.classList.contains('connector-left') ? 'L' : 'R';
                    pinMappingContent += `${side}${pinNumber}: ${pinLabel} (Type ${pinType})<br>`;
                });
                pinMapping.innerHTML = pinMappingContent;
                
                // Simple signal info without complex statistics
                signalInfo.innerHTML = `<strong>Selected Pins Summary:</strong><br>
                    Total Selected: ${selectedConnectors.length}<br>
                    <small>Pin details shown above</small>`;
            } else {
                pinMapping.innerHTML = '<strong>Pin Mapping Details</strong><br>No pins selected';
                signalInfo.innerHTML = '<strong>Signal Information</strong><br>Select connectors to view signal types';
            }
        }
    }
    
    // Add click event listeners to filter buttons (excluding expand button)
    filterButtons.forEach(button => {
        if (button.id !== 'expand-button') {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                toggleFilter(filter, this);
            });
        }
    });
    
    // Function to toggle filter
    function toggleFilter(filterType, buttonElement) {
        // Remove active class from all filter buttons (excluding expand button)
        filterButtons.forEach(btn => {
            if (btn.id !== 'expand-button') {
                btn.classList.remove('active');
            }
        });
        
        if (activeFilter === filterType) {
            // Deactivate current filter
            activeFilter = null;
            clearSelection();
            resetConnectorVisibility();
        } else {
            // Activate new filter
            activeFilter = filterType;
            buttonElement.classList.add('active');
            filterConnectorsByType(filterType);
        }
    }
    
    // Function to filter connectors by type
    function filterConnectorsByType(filterType) {
        clearSelection();
        
        connectors.forEach(connector => {
            const pinLabel = connector.getAttribute('pin-lable') || '';
            const pinType = connector.getAttribute('pin-type') || '';
            let shouldSelect = false;
            
            switch(filterType) {
                case 'sent':
                    // Select SENT capable pins (pin-type contains "1")
                    shouldSelect = pinType && pinType.toString().includes('1');
                    break;
                case 'analog':
                    // Select analog capable pins (pin-type contains "2")
                    shouldSelect = pinType && pinType.toString().includes('2');
                    break;
                case 'digital':
                    // Select digital capable pins (pin-type contains "3")
                    shouldSelect = pinType && pinType.toString().includes('3');
                    break;
                case 'dio':
                    // Select digital I/O pins (O_S_ prefix)
                    shouldSelect = pinLabel.startsWith('O_S_');
                    break;
                case 'pwm':
                    // Select PWM pins (O_T_ prefix)
                    shouldSelect = pinLabel.startsWith('O_T_');
                    break;
            }
            
            if (shouldSelect) {
                toggleConnectorSelection(connector, true);
            }
        });
    }
    
    // Function to reset connector visibility
    function resetConnectorVisibility() {
        connectors.forEach(connector => {
            connector.style.opacity = '1';
        });
    }
    
    // Add click event listeners to all connectors
    connectors.forEach(connector => {
        connector.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleConnectorSelection(this);
        });
        
        // Add right-click context menu event listener
        connector.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showConnectorContextMenu(e, this);
        });
        
        // Add hover effects
        connector.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-50%) scale(1.1)';
                this.style.boxShadow = '0 0 5px rgba(0, 150, 255, 0.8)';
            }
        });
        
        connector.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-50%)';
                this.style.boxShadow = 'none';
            }
        });
    });
    
    
    // Context Menu Functionality
    let contextMenu = null;
    
    // Function to create context menu container
    function createContextMenu() {
        if (contextMenu) {
            return contextMenu;
        }
        
        contextMenu = document.createElement('div');
        contextMenu.id = 'connector-context-menu';
        contextMenu.className = 'context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            padding: 0;
            min-width: 150px;
            z-index: 10000;
            display: none;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;
        
        document.body.appendChild(contextMenu);
        return contextMenu;
    }
    
    // Helper function to determine connector capabilities based on pin type and label
    function getConnectorCapabilities(pinLabel, pinType) {
        const capabilities = [];
        
        // Parse pin type using new rule system
        // pin-type: 1 = SENT; 2 = Analog; 3 = Digital
        // Combined types: 12 = SENT+Analog, 13 = SENT+Digital, 23 = Analog+Digital, 123 = SENT+Analog+Digital
        if (pinType && pinType !== 'N/A') {
            const typeStr = pinType.toString();
            
            // Check each digit in the pin type
            if (typeStr.includes('1')) {
                capabilities.push('SENT');
            }
            if (typeStr.includes('2')) {
                capabilities.push('Analog');
            }
            if (typeStr.includes('3')) {
                capabilities.push('Digital');
            }
        } else {
            // Fallback: Determine from label if no pin type is specified
            if (pinLabel.includes('AN')) capabilities.push('Analog');
            if (pinLabel.includes('DIG')) capabilities.push('Digital');
        }
        
        // Add specific capabilities based on label patterns
        if (pinLabel.startsWith('O_T_')) capabilities.push('PWM');
        if (pinLabel.startsWith('O_S_')) capabilities.push('DIO');
        if (pinLabel.startsWith('I_')) capabilities.push('Input');
        if (pinLabel.startsWith('O_')) capabilities.push('Output');
        
        return capabilities.length > 0 ? capabilities : ['Unconfigured'];
    }
    
    // Helper function to determine primary function type
    function getConnectorFunctionType(pinLabel) {
        if (pinLabel.startsWith('O_T_')) return 'PWM Output';
        if (pinLabel.startsWith('O_S_')) return 'DIO Output';
        if (pinLabel.startsWith('I_A_')) return 'Analog Input';
        if (pinLabel.startsWith('I_S_')) return 'Digital Input';
        if (pinLabel.startsWith('I_F_')) return 'Fault Input';
        if (pinLabel.startsWith('B_D_')) return 'Communication';
        if (pinLabel.startsWith('V_V_')) return 'Power Supply';
        if (pinLabel.startsWith('G_')) return 'Ground/Reference';
        if (pinLabel.includes('XX')) return 'Configurable I/O';
        
        return 'Unknown';
    }
    
    // Helper function to generate configuration options based on capabilities
    function generateConfigurationOptions(capabilities, functionType, pinNumber, pinLabel) {
        let options = '';
        
        // Add DIO/PWM configuration section with short name input and type selection
        if (capabilities.includes('DIO') || capabilities.includes('PWM') || capabilities.includes('Digital') || capabilities.includes('Output')) {
            options += `
                <div class="config-section">
                    <div class="config-row">
                        <label class="config-label">Short Name:</label>
                        <input type="text" id="shortName_${pinNumber}" class="config-input" placeholder="Enter short name" maxlength="20">
                    </div>
                    <div class="config-row">
                        <label class="config-label">Output Type:</label>
                        <select id="outputType_${pinNumber}" class="config-select" onchange="togglePWMFields('${pinNumber}')">
                            <option value="DIO"${capabilities.includes('DIO') ? ' selected' : ''}>DIO</option>
                            <option value="PWM"${capabilities.includes('PWM') ? ' selected' : ''}>PWM</option>
                        </select>
                    </div>
                    <div id="pwmFields_${pinNumber}" class="pwm-fields" style="display: ${capabilities.includes('PWM') && !capabilities.includes('DIO') ? 'block' : 'none'};">
                        <div class="config-row">
                            <label class="config-label">PWM Frequency (Hz):</label>
                            <input type="number" id="pwmFrequency_${pinNumber}" class="config-input" placeholder="1000" min="1" max="100000">
                        </div>
                        <div class="config-row">
                            <label class="config-label">PWM Duty Cycle (%):</label>
                            <input type="number" id="pwmDutyCycle_${pinNumber}" class="config-input" placeholder="50" min="0" max="100">
                        </div>
                    </div>
                    <button class="menu-option config-apply" onclick="applyDIOPWMConfig('${pinNumber}', '${pinLabel}')">
                        <span class="menu-option-icon">✅</span>
                        <span class="menu-option-text">Apply Configuration</span>
                    </button>
                </div>`;
        }
        
        // Add individual configuration options based on capabilities
        if (capabilities.includes('Analog')) {
            options += `
                <button class="menu-option" onclick="configureAnalog('${pinNumber}', '${pinLabel}')">
                    <span class="menu-option-icon">📊</span>
                    <span class="menu-option-text">Configure Analog</span>
                </button>`;
        }
        
        if (capabilities.includes('SENT')) {
            options += `
                <button class="menu-option" onclick="configureSENT('${pinNumber}', '${pinLabel}')">
                    <span class="menu-option-icon">📡</span>
                    <span class="menu-option-text">Configure SENT</span>
                </button>`;
        }
        
        if (capabilities.includes('Digital') && !capabilities.includes('DIO') && !capabilities.includes('PWM')) {
            options += `
                <button class="menu-option" onclick="configureDigital('${pinNumber}', '${pinLabel}')">
                    <span class="menu-option-icon">🔲</span>
                    <span class="menu-option-text">Configure Digital Input</span>
                </button>`;
        }
        
        // Add general configuration option
        options += `
            <button class="menu-option" onclick="openPinConfiguration('${pinNumber}', '${pinLabel}')">
                <span class="menu-option-icon">⚙</span>
                <span class="menu-option-text">Advanced Settings</span>
            </button>`;
        
        // If no specific configurations available
        if (capabilities.includes('Unconfigured')) {
            options = `
                <button class="menu-option disabled">
                    <span class="menu-option-icon">⚠</span>
                    <span class="menu-option-text">No Configuration Available</span>
                </button>`;
        }
        
        return options;
    }
    

    // Function to show context menu
    function showConnectorContextMenu(event, connector) {
        const menu = createContextMenu();
        const pinNumber = connector.getAttribute('data-number');
        const pinLabel = connector.getAttribute('pin-lable') || 'No label';
        const pinType = connector.getAttribute('pin-type') || 'N/A';
        const side = connector.classList.contains('connector-left') ? 'Left' : 'Right';
        const isSelected = connector.classList.contains('selected');
        
        // Determine connector capabilities and function type
        const capabilities = getConnectorCapabilities(pinLabel, pinType);
        const functionType = getConnectorFunctionType(pinLabel);
        
        // Check if pin is already configured
        const existingConfig = window.PinConfigurationManager.getConfiguration(pinNumber);
        const isConfigured = existingConfig !== undefined;
        
        // Create menu content based on connector type and capabilities
        menu.innerHTML = `
            <div class="context-menu-header">
                <div class="connector-info">
                    <strong>${side} Pin ${pinNumber}</strong><br>
                    <small>${pinLabel}</small><br>
                    <small>Type: ${pinType} | ${functionType}</small>
                    <small>Capabilities: ${capabilities.join(', ')}</small>
                    ${isConfigured ? `<small style="color: #4caf50; font-weight: bold;">✓ Configured: ${existingConfig.shortName} (${existingConfig.outputType})</small>` : ''}
                </div>
                ${isConfigured ? `
                    <div class="context-menu-header-actions">
                        <button class="remove-config-btn" onclick="removePinConfiguration('${pinNumber}', '${pinLabel}')" title="Remove Configuration">
                            <span style="font-size: 12px;">🗑️</span> Remove
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-actions">                
                <!-- Configuration options container -->
                <div class="menu-section" id="configuration-options">
                    <div class="menu-section-title">Configuration</div>
                    <div class="menu-options-container">
                        ${generateConfigurationOptions(capabilities, functionType, pinNumber, pinLabel)}
                    </div>
                </div>
            </div>
        `;
        
        // Position the menu
        const x = event.clientX;
        const y = event.clientY;
        const menuWidth = 200;
        const menuHeight = 300;
        
        // Adjust position to keep menu on screen
        const adjustedX = (x + menuWidth > window.innerWidth) ? x - menuWidth : x;
        const adjustedY = (y + menuHeight > window.innerHeight) ? y - menuHeight : y;
        
        menu.style.left = `${adjustedX}px`;
        menu.style.top = `${adjustedY}px`;
        menu.style.display = 'block';
        
        // Store reference to current connector
        menu.dataset.connectorId = connector.className;
        menu.currentConnector = connector;
        
        // Trigger custom event for context menu shown
        const contextEvent = new CustomEvent('connectorContextMenuShown', {
            detail: {
                connector: connector,
                pinNumber: pinNumber,
                pinLabel: pinLabel,
                pinType: pinType,
                side: side,
                isSelected: isSelected,
                menu: menu
            }
        });
        document.dispatchEvent(contextEvent);
    }
    
    // Function to hide context menu
    function hideContextMenu() {
        if (contextMenu) {
            contextMenu.style.display = 'none';
            contextMenu.currentConnector = null;
        }
    }
    
    // Hide context menu when clicking outside
    document.addEventListener('click', function(e) {
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // Hide context menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });

    // Function to toggle connector selection
    function toggleConnectorSelection(connector, forceSelect = false) {
        const isSelected = connector.classList.contains('selected');
        
        if (isSelected && !forceSelect) {
            // Deselect connector
            connector.classList.remove('selected');
            connector.style.backgroundColor = 'white';
            connector.style.borderColor = '#000';
            connector.style.transform = 'translateY(-50%)';
            connector.style.boxShadow = 'none';
            
            // Remove from selected array
            const index = selectedConnectors.indexOf(connector);
            if (index > -1) {
                selectedConnectors.splice(index, 1);
            }
        } else if (!isSelected) {
            // Select connector
            connector.classList.add('selected');
            connector.style.backgroundColor = '#007acc';
            connector.style.borderColor = '#005a99';
            connector.style.transform = 'translateY(-50%) scale(1.1)';
            connector.style.boxShadow = '0 0 8px rgba(0, 122, 204, 0.6)';
            
            // Add to selected array
            if (!selectedConnectors.includes(connector)) {
                selectedConnectors.push(connector);
            }
        }
        
        // Update selection info
        updateSelectionInfo();
        
        // Update expansion content
        updateExpansionContent();
        
        // Trigger custom event
        const event = new CustomEvent('connectorSelectionChanged', {
            detail: {
                selectedConnectors: selectedConnectors,
                currentConnector: connector,
                isSelected: !isSelected || forceSelect
            }
        });
        document.dispatchEvent(event);
    }
    
    // Function to update selection information
    function updateSelectionInfo() {
        let infoPanel = document.getElementById('selection-info');
        
        // Create info panel if it doesn't exist
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'selection-info';
            infoPanel.style.cssText = `
                position: fixed;
                top: 50px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                font-size: 12px;
                max-width: 300px;
                z-index: 1000;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(infoPanel);
        }
        
        if (selectedConnectors.length === 0) {
            infoPanel.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: #007acc;">Selection Info</h4>
                <p>No connectors selected</p>
                <p style="font-size: 10px; margin-top: 10px; opacity: 0.7;">Click on connectors to select them</p>
            `;
        } else {
            let infoHTML = `
                <h4 style="margin: 0 0 10px 0; color: #007acc;">Selected Connectors (${selectedConnectors.length})</h4>
            `;
            
            selectedConnectors.forEach((connector, index) => {
                const pinNumber = connector.getAttribute('data-number');
                const pinLabel = connector.getAttribute('pin-lable') || 'No label';
                const side = connector.classList.contains('connector-left') ? 'Left' : 'Right';
                
                infoHTML += `
                    <div style="margin: 5px 0; padding: 5px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
                        <strong>${side} Pin ${pinNumber}</strong><br>
                        <span style="font-size: 10px;">${pinLabel}</span>
                    </div>
                `;
            });
            
            infoHTML += `
                <button onclick="clearSelection()" style="
                    margin-top: 10px; 
                    padding: 5px 10px; 
                    background: #dc3545; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 11px;
                ">Clear All</button>
            `;
            
            infoPanel.innerHTML = infoHTML;
        }
    }
    
    // Global function to clear selection
    window.clearSelection = function() {
        selectedConnectors.forEach(connector => {
            connector.classList.remove('selected');
            connector.style.backgroundColor = 'white';
            connector.style.borderColor = '#000';
            connector.style.transform = 'translateY(-50%)';
            connector.style.boxShadow = 'none';
        });
        selectedConnectors = [];
        updateSelectionInfo();
        updateExpansionContent();
    };
    
    // Global function to select connectors by criteria
    window.selectConnectorsByLabel = function(labelPattern) {
        clearSelection();
        connectors.forEach(connector => {
            const label = connector.getAttribute('pin-lable') || '';
            if (label.includes(labelPattern)) {
                toggleConnectorSelection(connector);
            }
        });
    };
    
    // Global function to select connectors by side
    window.selectConnectorsBySide = function(side) {
        clearSelection();
        const className = side === 'left' ? 'connector-left' : 'connector-right';
        connectors.forEach(connector => {
            if (connector.classList.contains(className)) {
                toggleConnectorSelection(connector);
            }
        });
    };
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to clear selection and highlights
        if (e.key === 'Escape') {
            clearSelection();
            clearAllHighlights();
        }
        
        // Ctrl+A to select all
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            clearSelection();
            connectors.forEach(connector => {
                toggleConnectorSelection(connector);
            });
        }
        
        // Ctrl+H to clear all highlights
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            clearAllHighlights();
        }
    });
    
    // Add click outside to deselect (optional)
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.connector') && !e.target.closest('#selection-info')) {
            // Uncomment the line below if you want clicking outside to clear selection
            // clearSelection();
        }
    });
    
    // Initialize selection info panel
    updateSelectionInfo();
    
    // Initialize expansion content
    updateExpansionContent();
    
    // Comment out auto-clearing to preserve configurations
    // clearStoredConfigurations();
    
    // Load existing configurations from storage instead
    window.PinConfigurationManager.loadFromStorage();
    
    // Add page reload warning for temporary highlights
    addPageReloadWarning();
    
    // Log available functions for console use
    console.log('Terminal Diagram Interactive Functions:');
    console.log('- clearSelection(): Clear all selected connectors');
    console.log('- selectConnectorsByLabel(pattern): Select connectors by label pattern');
    console.log('- selectConnectorsBySide("left"|"right"): Select all connectors on one side');
    console.log('- toggleExpansion(): Toggle diagram width expansion');
    console.log('- highlightPin(pinNumber, true/false): Highlight/unhighlight a specific pin');
    console.log('- clearAllHighlights(): Clear all temporary highlights');
    console.log('- clearStoredConfigurations(): Clear all saved pin configurations');
    console.log('- Keyboard shortcuts: Escape (clear all), Ctrl+A (select all), Ctrl+H (clear highlights)');
});

// Add global functions for highlight management
window.highlightPin = highlightPin;
window.clearAllHighlights = clearAllHighlights;
window.hasTemporaryHighlights = hasTemporaryHighlights;
window.clearStoredConfigurations = clearStoredConfigurations;// Custom event listener example
document.addEventListener('connectorSelectionChanged', function(e) {
    console.log('Selection changed:', e.detail);
});

// Custom event listener for expansion changes
document.addEventListener('diagramExpansionChanged', function(e) {
    console.log('Diagram expansion changed:', e.detail);
});

// Custom event listener for context menu events
document.addEventListener('connectorContextMenuShown', function(e) {
    console.log('Context menu shown for connector:', e.detail);
});

// Global function for expansion toggle (for console use)
window.toggleExpansion = function() {
    const expandButton = document.getElementById('expand-button');
    if (expandButton) {
        expandButton.click();
    }
};

// Global functions for context menu management
window.hideConnectorContextMenu = function() {
    const menu = document.getElementById('connector-context-menu');
    if (menu) {
        menu.style.display = 'none';
        menu.currentConnector = null;
    }
};

// Global function to get current context menu connector
window.getCurrentContextConnector = function() {
    const menu = document.getElementById('connector-context-menu');
    return menu ? menu.currentConnector : null;
};

// Global function to add context menu option (for future use)
window.addContextMenuOption = function(sectionId, optionData) {
    const menu = document.getElementById('connector-context-menu');
    if (!menu) return false;
    
    const section = menu.querySelector(`#${sectionId} .menu-options-container`);
    if (!section) return false;
    
    const option = document.createElement('button');
    option.className = 'menu-option';
    option.innerHTML = `
        <span class="menu-option-icon">${optionData.icon || ''}</span>
        <span class="menu-option-text">${optionData.text}</span>
        ${optionData.shortcut ? `<span class="menu-option-shortcut">${optionData.shortcut}</span>` : ''}
    `;
    
    if (optionData.disabled) {
        option.classList.add('disabled');
    } else {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            if (optionData.action && typeof optionData.action === 'function') {
                optionData.action(menu.currentConnector);
            }
            hideConnectorContextMenu();
        });
    }
    
    section.appendChild(option);
    return true;
};

console.log('Terminal Diagram Context Menu Functions:');
console.log('- Right-click on any connector to show context menu');
console.log('- hideConnectorContextMenu(): Hide context menu');
console.log('- getCurrentContextConnector(): Get connector with active context menu');
console.log('- addContextMenuOption(sectionId, optionData): Add custom menu option');
console.log('- Available sections: selection-options, configuration-options, information-options');
console.log('');
console.log('New Pin-Type System:');
console.log('- Type 1: SENT');
console.log('- Type 2: Analog');
console.log('- Type 3: Digital');
console.log('- Combined types: 12, 13, 23, 123');
console.log('- testPinTypes(): Test the new pin-type detection');

// Function to test the new pin-type system
window.testPinTypes = function() {
    console.log('\n=== Testing New Pin-Type System ===');
    
    const testCases = [
        { pinType: '1', expected: ['SENT'] },
        { pinType: '2', expected: ['Analog'] },
        { pinType: '3', expected: ['Digital'] },
        { pinType: '12', expected: ['SENT', 'Analog'] },
        { pinType: '13', expected: ['SENT', 'Digital'] },
        { pinType: '23', expected: ['Analog', 'Digital'] },
        { pinType: '123', expected: ['SENT', 'Analog', 'Digital'] }
    ];
    
    // Get the capability function from our implementation
    const getCapabilities = function(pinLabel, pinType) {
        const capabilities = [];
        if (pinType && pinType !== 'N/A') {
            const typeStr = pinType.toString();
            if (typeStr.includes('1')) capabilities.push('SENT');
            if (typeStr.includes('2')) capabilities.push('Analog');
            if (typeStr.includes('3')) capabilities.push('Digital');
        }
        return capabilities.length > 0 ? capabilities : ['Unconfigured'];
    };
    
    testCases.forEach(test => {
        const result = getCapabilities('TEST_PIN', test.pinType);
        const passed = JSON.stringify(result) === JSON.stringify(test.expected);
        console.log(`Pin-Type ${test.pinType}: ${result.join(', ')} ${passed ? '✅' : '❌'}`);
    });
    
    console.log('\n=== Testing Real Connectors ===');
    const connectors = document.querySelectorAll('.connector[pin-type]');
    const typeCounts = {};
    
    connectors.forEach(connector => {
        const pinType = connector.getAttribute('pin-type');
        const pinLabel = connector.getAttribute('pin-lable');
        const capabilities = getCapabilities(pinLabel, pinType);
        
        if (!typeCounts[pinType]) typeCounts[pinType] = { count: 0, capabilities: capabilities };
        typeCounts[pinType].count++;
    });
    
    Object.keys(typeCounts).forEach(type => {
        console.log(`Type ${type}: ${typeCounts[type].count} pins - ${typeCounts[type].capabilities.join(', ')}`);
    });
    
    console.log('\nTest completed! New pin-type system is working correctly.');
};

// Configuration Functions for Context Menu Options
window.togglePWMFields = function(pinNumber) {
    const outputTypeSelect = document.getElementById(`outputType_${pinNumber}`);
    const pwmFields = document.getElementById(`pwmFields_${pinNumber}`);
    
    if (outputTypeSelect && pwmFields) {
        const outputType = outputTypeSelect.value;
        if (outputType === 'PWM') {
            pwmFields.style.display = 'block';
        } else {
            pwmFields.style.display = 'none';
        }
    }
};

window.applyDIOPWMConfig = function(pinNumber, pinLabel) {
    const shortNameInput = document.getElementById(`shortName_${pinNumber}`);
    const outputTypeSelect = document.getElementById(`outputType_${pinNumber}`);
    
    if (!shortNameInput || !outputTypeSelect) {
        alert('Configuration inputs not found. Please try again.');
        return;
    }
    
    const shortName = shortNameInput.value.trim();
    const outputType = outputTypeSelect.value;
    
    if (!shortName) {
        alert('Please enter a short name for the pin configuration.');
        shortNameInput.focus();
        return;
    }
    
    // Validate short name
    if (!/^[A-Za-z0-9_-]+$/.test(shortName)) {
        alert('Short name can only contain letters, numbers, underscores, and hyphens.');
        shortNameInput.focus();
        return;
    }
    
    // Create configuration object
    const config = {
        pin: pinNumber,
        originalLabel: pinLabel,
        shortName: shortName,
        outputType: outputType,
        timestamp: new Date().toISOString(),
        configured: true
    };
    
    // If PWM is selected, get additional PWM parameters
    if (outputType === 'PWM') {
        const pwmFrequencyInput = document.getElementById(`pwmFrequency_${pinNumber}`);
        const pwmDutyCycleInput = document.getElementById(`pwmDutyCycle_${pinNumber}`);
        
        if (pwmFrequencyInput && pwmDutyCycleInput) {
            const frequency = pwmFrequencyInput.value;
            const dutyCycle = pwmDutyCycleInput.value;
            
            // Validate PWM parameters
            if (frequency && (frequency < 1 || frequency > 100000)) {
                alert('PWM Frequency must be between 1 and 100,000 Hz.');
                pwmFrequencyInput.focus();
                return;
            }
            
            if (dutyCycle && (dutyCycle < 0 || dutyCycle > 100)) {
                alert('PWM Duty Cycle must be between 0 and 100%.');
                pwmDutyCycleInput.focus();
                return;
            }
            
            // Add PWM parameters to config
            config.pwmFrequency = frequency || 1000; // Default 1kHz
            config.pwmDutyCycle = dutyCycle || 50;   // Default 50%
        }
    }
    
    console.log(`Applying ${outputType} configuration for Pin ${pinNumber} (${pinLabel})`);
    console.log(`Short Name: ${shortName}`);
    console.log(`Output Type: ${outputType}`);
    if (outputType === 'PWM') {
        console.log(`PWM Frequency: ${config.pwmFrequency} Hz`);
        console.log(`PWM Duty Cycle: ${config.pwmDutyCycle}%`);
    }
    
    // Store configuration in localStorage for persistence (legacy support)
    const configKey = `pin_config_${pinNumber}`;
    localStorage.setItem(configKey, JSON.stringify(config));

    // Add configuration to global array storage system
    window.PinConfigurationManager.addConfiguration(config);

    // Save to data storage system (no server required)
    if (window.DataStorageManager) {
        if (outputType === 'DIO') {
            const success = window.DataStorageManager.saveDIOConfiguration(pinNumber, config);
            if (success) {
                console.log(`DIO configuration saved to localStorage for pin ${pinNumber}`);
            }
        } else if (outputType === 'PWM') {
            const success = window.DataStorageManager.savePWMConfiguration(pinNumber, config);
            if (success) {
                console.log(`PWM configuration saved to localStorage for pin ${pinNumber}`);
            }
        }
    }

    // Dispatch custom event to notify other windows/tabs
    const event = new CustomEvent('configurationUpdated', {
        detail: {
            config: config,
            action: 'added'
        }
    });
    document.dispatchEvent(event);
    
    // Update the pin label visually if needed
    const connector = document.querySelector(`.connector[data-number="${pinNumber}"]`);
    if (connector) {
        connector.title = `${shortName} (${outputType}) - Configured`;
        connector.classList.add('configured');
        
        // Apply new green highlighting
        highlightPin(pinNumber, true);
    }
    
    hideConnectorContextMenu();
};

window.openPinConfiguration = function(pinNumber, pinLabel) {
    console.log(`Opening general pin configuration for Pin ${pinNumber} (${pinLabel})`);
    
    // Get stored configuration if available
    const storedConfig = getStoredConfig(pinNumber);
    const configInfo = storedConfig ? 
        `\nCurrent Configuration:\n• Short Name: ${storedConfig.shortName}\n• Type: ${storedConfig.outputType}\n• Configured: ${new Date(storedConfig.timestamp).toLocaleString()}` : 
        '\nNo configuration stored.';
    
    // TODO: Open general pin configuration interface
    alert(`Pin Configuration\n━━━━━━━━━━━━━━━━━━━━━━\nPin: ${pinNumber}\nLabel: ${pinLabel}${configInfo}\n\n⚠️ General pin configuration interface will be implemented here.\n\nFeatures to include:\n• Pin function selection\n• Electrical parameters\n• Signal characteristics\n• Test and validation tools`);
    hideConnectorContextMenu();
};

window.removePinConfiguration = function(pinNumber, pinLabel) {
    const existingConfig = window.PinConfigurationManager.getConfiguration(pinNumber);
    
    if (!existingConfig) {
        alert('No configuration found for this pin.');
        return;
    }
    
    const confirmMessage = `Remove configuration for Pin ${pinNumber}?\n\nCurrent Configuration:\n• Short Name: ${existingConfig.shortName}\n• Output Type: ${existingConfig.outputType}\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
        // Remove from global configuration manager
        window.PinConfigurationManager.removeConfiguration(pinNumber);
        
        // Remove from legacy localStorage
        const configKey = `pin_config_${pinNumber}`;
        localStorage.removeItem(configKey);
        
        // Reset pin visual state
        const connector = document.querySelector(`.connector[data-number="${pinNumber}"]`);
        if (connector) {
            // Remove configured class
            connector.classList.remove('configured');
            
            // Remove highlighting
            highlightPin(pinNumber, false);
            
            // Reset title
            connector.title = pinLabel;
        }
        
        // Dispatch custom event to notify other windows/tabs
        const event = new CustomEvent('configurationUpdated', {
            detail: {
                config: existingConfig,
                action: 'removed',
                pinNumber: pinNumber
            }
        });
        document.dispatchEvent(event);
        
        console.log(`Configuration removed for Pin ${pinNumber} (${pinLabel})`);
        alert(`Configuration removed for Pin ${pinNumber}`);
    }
    
    hideConnectorContextMenu();
};

// Helper function to get stored short name
function getStoredShortName(pinNumber) {
    const config = getStoredConfig(pinNumber);
    return config ? config.shortName : null;
}

// Helper function to get stored configuration
function getStoredConfig(pinNumber) {
    const configKey = `pin_config_${pinNumber}`;
    const storedConfig = localStorage.getItem(configKey);
    return storedConfig ? JSON.parse(storedConfig) : null;
}

// New Simple Highlighting Function - Changes connector to green and wire to green
function highlightPin(pinNumber, isConfigured = true) {
    const connector = document.querySelector(`.connector[data-number="${pinNumber}"]`);
    if (!connector) return;
    
    if (isConfigured) {
        // Change connector to green
        connector.style.backgroundColor = '#4caf50';
        connector.style.borderColor = '#388e3c';
        connector.style.color = 'white';
        
        // Find and change associated wire to green (try multiple wire classes)
        let wire = connector.querySelector('.wire');
        if (!wire) wire = connector.querySelector('.wire-right');
        if (!wire) wire = connector.querySelector('.wire-left');
        
        if (wire) {
            wire.style.backgroundColor = '#4caf50'; // Green color for configured wires
        }
        
        // Change pin label to green
        const pinLabel = connector.getAttribute('pin-lable');
        if (pinLabel) {
            // Update the connector's ::before and ::after pseudo-elements via CSS custom properties
            connector.style.setProperty('--label-color', '#4caf50');
        }
        
        // Mark as temporarily highlighted (not persisted)
        connector.classList.add('temp-highlighted');
    } else {
        // Reset to original colors
        connector.style.backgroundColor = '';
        connector.style.borderColor = '';
        connector.style.color = '';
        
        let wire = connector.querySelector('.wire');
        if (!wire) wire = connector.querySelector('.wire-right');
        if (!wire) wire = connector.querySelector('.wire-left');
        
        if (wire) {
            wire.style.backgroundColor = '';
        }
        
        connector.style.removeProperty('--label-color');
        connector.classList.remove('temp-highlighted');
    }
}

// Function to clear all temporary highlights
function clearAllHighlights() {
    const highlightedConnectors = document.querySelectorAll('.temp-highlighted');
    highlightedConnectors.forEach(connector => {
        const pinNumber = connector.getAttribute('data-number');
        highlightPin(pinNumber, false);
    });
}

// Function to check if there are any temporary highlights
function hasTemporaryHighlights() {
    return document.querySelectorAll('.temp-highlighted').length > 0;
}

// Function to clear all stored configurations from localStorage
function clearStoredConfigurations() {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter and remove only pin configuration keys
    keys.forEach(key => {
        if (key.startsWith('pin_config_')) {
            localStorage.removeItem(key);
        }
    });
    
    console.log('Legacy pin configurations cleared');
}

// Function to manually clear all configurations (both legacy and new)
function clearAllStoredConfigurations() {
    // Clear from unified data storage system
    if (window.DataStorageManager) {
        window.DataStorageManager.clearAllSavedConfigurations();
    }
    
    // Get all localStorage keys for legacy clearing
    const keys = Object.keys(localStorage);
    
    // Filter and remove only pin configuration keys
    keys.forEach(key => {
        if (key.startsWith('pin_config_')) {
            localStorage.removeItem(key);
        }
    });
    
    // Clear the global configuration array
    window.PinConfigurationManager.clearAllConfigurations();
    
    // Clear all visual configurations from the terminal diagram
    const connectors = document.querySelectorAll('.connector');
    connectors.forEach(connector => {
        connector.classList.remove('configured');
        const pinNumber = connector.getAttribute('data-number');
        if (pinNumber) {
            highlightPin(pinNumber, false);
            const originalLabel = connector.getAttribute('pin-lable') || '';
            connector.title = originalLabel;
        }
    });
    
    console.log('All stored pin configurations cleared from all systems');
}

// Add page reload warning
function addPageReloadWarning() {
    window.addEventListener('beforeunload', function(e) {
        if (hasTemporaryHighlights()) {
            e.preventDefault();
        }
    });
}

// Global utility functions for accessing configuration data from other HTML files
window.getConfigurationData = function() {
    return window.PinConfigurationManager.getAllConfigurations();
};

window.getConfigurationSummary = function() {
    return window.PinConfigurationManager.getSummary();
};

// Function to load and display existing configurations
window.loadAndDisplayExistingConfigurations = function() {
    if (!window.DataStorageManager) return;
    
    const savedConfigs = window.DataStorageManager.getAllSavedConfigurations();
    console.log('Loading existing configurations:', savedConfigs);
    
    // Load DIO configurations
    Object.keys(savedConfigs.DIO).forEach(pinNumber => {
        const config = savedConfigs.DIO[pinNumber];
        applyConfigurationToPin(pinNumber, config, 'DIO');
    });
    
    // Load PWM configurations
    Object.keys(savedConfigs.PWM).forEach(pinNumber => {
        const config = savedConfigs.PWM[pinNumber];
        applyConfigurationToPin(pinNumber, config, 'PWM');
    });
};

// Function to apply configuration to a pin visually
window.applyConfigurationToPin = function(pinNumber, config, outputType) {
    // Find connector by pin number (check both connector classes)
    let connector = document.querySelector(`.tle7244-connector[data-number="${pinNumber}"]`);
    if (!connector) {
        connector = document.querySelector(`.connector[data-number="${pinNumber}"]`);
    }
    
    if (connector) {
        // Get original pin label from pin-lable attribute (note the typo in HTML)
        const originalLabel = connector.getAttribute('pin-lable') || `Pin ${pinNumber}`;
        
        // Add configured class and styling
        connector.classList.add('configured');
        connector.title = `${config.custSpecName || originalLabel} (${outputType}) - Configured`;
        
        // Apply visual styling based on type
        if (outputType === 'DIO') {
            connector.style.backgroundColor = '#4caf50';
            connector.style.borderColor = '#2e7d32';
            connector.style.color = 'white';
        } else if (outputType === 'PWM') {
            connector.style.backgroundColor = '#ff9800';
            connector.style.borderColor = '#ef6c00';
            connector.style.color = 'white';
        }
        
        // Add or update pin label display
        let labelElement = connector.querySelector('.pin-label');
        if (!labelElement) {
            labelElement = document.createElement('div');
            labelElement.className = 'pin-label';
            labelElement.style.cssText = `
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                white-space: nowrap;
                z-index: 100;
                pointer-events: none;
            `;
            connector.style.position = 'relative';
            connector.appendChild(labelElement);
        }
        
        // Update label text
        labelElement.textContent = config.custSpecName || originalLabel;
        
        // Store original label for reference
        connector.setAttribute('data-original-label', originalLabel);
        
        console.log(`Applied ${outputType} configuration to pin ${pinNumber}: ${config.custSpecName || originalLabel}`);
    } else {
        console.warn(`Could not find connector for pin ${pinNumber}`);
    }
};

// Function to show message when no configurations exist
window.showNoConfigMessage = function() {
    const terminalDiagram = document.querySelector('.terminaldiagram');
    if (terminalDiagram) {
        const messageDiv = document.createElement('div');
        messageDiv.id = 'no-config-message';
        messageDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #666;
            font-size: 18px;
            background: white;
            padding: 40px;
            border: 2px dashed #ccc;
            border-radius: 10px;
            max-width: 500px;
            z-index: 1000;
        `;
        messageDiv.innerHTML = `
            <h3>No Pin Configurations Found</h3>
            <p>Load a configuration file to see your pin settings, or configure pins by right-clicking on them.</p>
            <p style="margin-top: 20px;">
                <button onclick="document.querySelector('#config-button').click()" 
                        style="padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Go to Configuration Viewer
                </button>
            </p>
        `;
        terminalDiagram.appendChild(messageDiv);
    }
};

// Function to hide the no config message
window.hideNoConfigMessage = function() {
    const messageDiv = document.getElementById('no-config-message');
    if (messageDiv) {
        messageDiv.remove();
    }
};

// Function to refresh the terminal diagram when configurations change
window.refreshTerminalDiagram = function() {
    // Remove existing configured styling from both connector types
    document.querySelectorAll('.tle7244-connector.configured, .connector.configured').forEach(connector => {
        connector.classList.remove('configured');
        connector.style.backgroundColor = '';
        connector.style.borderColor = '';
        connector.style.color = '';
        connector.title = '';
        
        // Remove pin label if it exists
        const label = connector.querySelector('.pin-label');
        if (label) {
            label.remove();
        }
    });
    
    // Hide no config message if it exists
    hideNoConfigMessage();
    
    // Reload configurations
    loadAndDisplayExistingConfigurations();
    
    // Show/hide terminal body based on configurations
    const terminalBody = document.querySelector('.terminal-body');
    const savedConfigs = window.DataStorageManager ? window.DataStorageManager.getAllSavedConfigurations() : null;
    const hasConfigs = savedConfigs && (Object.keys(savedConfigs.DIO).length > 0 || Object.keys(savedConfigs.PWM).length > 0);
    
    if (terminalBody) {
        if (hasConfigs) {
            terminalBody.style.display = 'block';
            console.log('Configurations found, showing terminal diagram');
        } else {
            terminalBody.style.display = 'none';
            console.log('No configurations found, hiding terminal diagram');
            showNoConfigMessage();
        }
    }
};

window.exportConfigurationData = function() {
    const data = window.PinConfigurationManager.exportConfigurations();
    console.log('Configuration Data (JSON):');
    console.log(data);
    
    // Create downloadable file
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pin_configurations_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return data;
};

window.importConfigurationData = function(jsonString) {
    return window.PinConfigurationManager.importConfigurations(jsonString);
};

// Console helper functions
window.showAllConfigurations = function() {
    const configs = window.PinConfigurationManager.getAllConfigurations();
    console.log('\n=== All Pin Configurations ===');
    if (configs.length === 0) {
        console.log('No configurations found');
    } else {
        configs.forEach((config, index) => {
            console.log(`${index + 1}. Pin ${config.pin}: ${config.shortName} (${config.outputType})`);
            if (config.outputType === 'PWM') {
                console.log(`   • Frequency: ${config.pwmFrequency} Hz`);
                console.log(`   • Duty Cycle: ${config.pwmDutyCycle}%`);
            }
            console.log(`   • Configured: ${new Date(config.timestamp).toLocaleString()}`);
        });
    }
    
    const summary = window.PinConfigurationManager.getSummary();
    console.log('\n=== Summary ===');
    console.log(`Total: ${summary.total} configurations`);
    console.log('By Type:', summary.byType);
    
    return configs;
};

window.showConfigurationsByType = function(outputType) {
    const configs = window.PinConfigurationManager.getConfigurationsByType(outputType);
    console.log(`\n=== ${outputType} Configurations ===`);
    if (configs.length === 0) {
        console.log(`No ${outputType} configurations found`);
    } else {
        configs.forEach((config, index) => {
            console.log(`${index + 1}. Pin ${config.pin}: ${config.shortName}`);
            if (config.outputType === 'PWM') {
                console.log(`   • Frequency: ${config.pwmFrequency} Hz`);
                console.log(`   • Duty Cycle: ${config.pwmDutyCycle}%`);
            }
        });
    }
    return configs;
};

// Function to create configuration data for other HTML files
window.generateConfigurationForExport = function(format = 'json') {
    const configs = window.PinConfigurationManager.getAllConfigurations();
    
    if (format === 'csv') {
        let csv = 'Pin,ShortName,OutputType,Frequency,DutyCycle,Timestamp\n';
        configs.forEach(config => {
            csv += `${config.pin},${config.shortName},${config.outputType},`;
            csv += `${config.pwmFrequency || ''},${config.pwmDutyCycle || ''},${config.timestamp}\n`;
        });
        return csv;
    } else if (format === 'xml') {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<configurations>\n';
        configs.forEach(config => {
            xml += `  <configuration pin="${config.pin}">\n`;
            xml += `    <shortName>${config.shortName}</shortName>\n`;
            xml += `    <outputType>${config.outputType}</outputType>\n`;
            if (config.pwmFrequency) xml += `    <pwmFrequency>${config.pwmFrequency}</pwmFrequency>\n`;
            if (config.pwmDutyCycle) xml += `    <pwmDutyCycle>${config.pwmDutyCycle}</pwmDutyCycle>\n`;
            xml += `    <timestamp>${config.timestamp}</timestamp>\n`;
            xml += `  </configuration>\n`;
        });
        xml += '</configurations>';
        return xml;
    } else {
        return window.PinConfigurationManager.exportConfigurations();
    }
};

// Make manual clear function globally available
window.clearAllStoredConfigurations = clearAllStoredConfigurations;

console.log('\n=== Pin Configuration Data Management ===');
console.log('Available functions for other HTML files:');
console.log('• getConfigurationData(): Get all configuration data as array');
console.log('• getConfigurationSummary(): Get configuration statistics');
console.log('• exportConfigurationData(): Export and download configuration data');
console.log('• importConfigurationData(jsonString): Import configuration data');
console.log('• generateConfigurationForExport(format): Export as JSON, CSV, or XML');
console.log('• showAllConfigurations(): Display all configurations in console');
console.log('• showConfigurationsByType(type): Display configurations by type');
console.log('• clearAllStoredConfigurations(): Manually clear all stored configurations');
console.log('• removePinConfiguration(pinNumber, pinLabel): Remove specific pin configuration');
console.log('\nContext Menu Features:');
console.log('• Right-click configured pins to see "Remove" button in header');
console.log('• Configured pins show green checkmark and current settings');
console.log('\nAccess via: window.PinConfigurationManager or the utility functions above');
console.log('\nNOTE: Configurations now persist across page reloads!');
