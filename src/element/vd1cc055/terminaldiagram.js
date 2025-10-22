// Terminal Diagram Interactive Script
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Add click event listener to terminal body for expansion toggle
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        terminalBody.addEventListener('click', function() {
            toggleExpansion();
        });
    }
    
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
                    
                    // Determine connector side/position
                    let side = 'U';
                    if (connector.classList.contains('connector-left')) side = 'L';
                    else if (connector.classList.contains('connector-right')) side = 'R';
                    else if (connector.classList.contains('connector-top')) side = 'T';
                    else if (connector.classList.contains('connector-bottom')) side = 'B';
                    
                    pinMappingContent += `${side}${pinNumber}: ${pinLabel} (Type ${pinType})<br>`;
                });
                pinMapping.innerHTML = pinMappingContent;
                
                // Update signal info with pin-type classification
                let signalTypes = {
                    sentCapable: 0,  // pin-type="1"
                    analogCapable: 0, // pin-type="1" or "2"
                    digitalOnly: 0,  // pin-type="3"
                    power: 0,
                    communication: 0,
                    other: 0
                };
                
                let pinTypeCount = { type1: 0, type2: 0, type3: 0, noType: 0 };
                
                selectedConnectors.forEach(connector => {
                    const pinLabel = connector.getAttribute('pin-lable') || '';
                    const pinType = connector.getAttribute('pin-type') || '';
                    
                    // Count pin types
                    switch(pinType) {
                        case '1': pinTypeCount.type1++; break;
                        case '2': pinTypeCount.type2++; break;
                        case '3': pinTypeCount.type3++; break;
                        default: pinTypeCount.noType++; break;
                    }
                    
                    // Classify by capabilities
                    if (pinType === '1') signalTypes.sentCapable++;
                    if (pinType === '1' || pinType === '2') signalTypes.analogCapable++;
                    if (pinType === '3') signalTypes.digitalOnly++;
                    
                    // Additional classifications by label
                    if (pinLabel.includes('_V_') || pinLabel.includes('_R_')) signalTypes.power++;
                    else if (pinLabel.startsWith('B_D_')) signalTypes.communication++;
                    else if (!['1', '2', '3'].includes(pinType)) signalTypes.other++;
                });
                
                signalInfo.innerHTML = `<strong>Pin Type Distribution:</strong><br>
                    Type 1 (SENT/ANALOG/DIGITAL): ${pinTypeCount.type1}<br>
                    Type 2 (ANALOG/DIGITAL): ${pinTypeCount.type2}<br>
                    Type 3 (DIGITAL only): ${pinTypeCount.type3}<br>
                    <hr style="margin: 8px 0;">
                    <strong>Capability Summary:</strong><br>
                    SENT Capable: ${signalTypes.sentCapable}<br>
                    Analog Capable: ${signalTypes.analogCapable}<br>
                    Digital Only: ${signalTypes.digitalOnly}<br>
                    Power/Ground: ${signalTypes.power}<br>
                    Communication: ${signalTypes.communication}`;
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
                    // Select SENT capable pins (pin-type="1" and specific labels)
                    shouldSelect = pinType === '1';
                    break;
                case 'analog':
                    // Select analog capable pins (pin-type="1" or "2" with analog labels)
                    shouldSelect = (pinType === '1' || pinType === '2');
                    break;
                case 'digital':
                    // Select digital capable pins (pin-type="1", "2", or "3" with digital labels)
                    shouldSelect = (pinType === '1' || pinType === '2' || pinType === '3');
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
                this.style.transform = 'translateY(-50%) scale(1.2)';
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
    
    // Function to show context menu
    function showConnectorContextMenu(event, connector) {
        const menu = createContextMenu();
        const pinNumber = connector.getAttribute('data-number');
        const pinLabel = connector.getAttribute('pin-lable') || 'No label';
        const pinType = connector.getAttribute('pin-type') || 'N/A';
        
        // Determine connector side/position
        let side = 'Unknown';
        if (connector.classList.contains('connector-left')) side = 'Left';
        else if (connector.classList.contains('connector-right')) side = 'Right';
        else if (connector.classList.contains('connector-top')) side = 'Top';
        else if (connector.classList.contains('connector-bottom')) side = 'Bottom';
        
        const isSelected = connector.classList.contains('selected');
        
        // Create menu content (empty container structure for now)
        menu.innerHTML = `
            <div class="context-menu-header">
                <div class="connector-info">
                    <strong>${side} Pin ${pinNumber}</strong><br>
                    <small>${pinLabel}</small><br>
                    <small>Type: ${pinType}</small>
                </div>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-actions">
                <!-- Selection options container -->
                <div class="menu-section" id="selection-options">
                    <div class="menu-section-title">Selection</div>
                    <div class="menu-options-container">
                        <!-- Options will be added here in next step -->
                    </div>
                </div>
                
                <!-- Configuration options container -->
                <div class="menu-section" id="configuration-options">
                    <div class="menu-section-title">Configuration</div>
                    <div class="menu-options-container">
                        <!-- Options will be added here in next step -->
                    </div>
                </div>
                
                <!-- Information options container -->
                <div class="menu-section" id="information-options">
                    <div class="menu-section-title">Information</div>
                    <div class="menu-options-container">
                        <!-- Options will be added here in next step -->
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
                top: 20px;
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
                    
                    // Determine connector side/position
                    let side = 'Unknown';
                    if (connector.classList.contains('connector-left')) side = 'Left';
                    else if (connector.classList.contains('connector-right')) side = 'Right';
                    else if (connector.classList.contains('connector-top')) side = 'Top';
                    else if (connector.classList.contains('connector-bottom')) side = 'Bottom';                infoHTML += `
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
        let className = '';
        switch(side.toLowerCase()) {
            case 'left':
                className = 'connector-left';
                break;
            case 'right':
                className = 'connector-right';
                break;
            case 'top':
                className = 'connector-top';
                break;
            case 'bottom':
                className = 'connector-bottom';
                break;
        }
        
        if (className) {
            connectors.forEach(connector => {
                if (connector.classList.contains(className)) {
                    toggleConnectorSelection(connector);
                }
            });
        }
    };
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to clear selection
        if (e.key === 'Escape') {
            clearSelection();
        }
        
        // Ctrl+A to select all
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            clearSelection();
            connectors.forEach(connector => {
                toggleConnectorSelection(connector);
            });
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
    
    // Log available functions for console use
    console.log('Terminal Diagram Interactive Functions:');
    console.log('- clearSelection(): Clear all selected connectors');
    console.log('- selectConnectorsByLabel(pattern): Select connectors by label pattern');
    console.log('- selectConnectorsBySide("left"|"right"|"top"|"bottom"): Select all connectors on specified side');
    console.log('- toggleExpansion(): Toggle diagram width expansion');
    console.log('- Keyboard shortcuts: Escape (clear), Ctrl+A (select all)');
});

// Custom event listener example
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
