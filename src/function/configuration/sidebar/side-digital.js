function generateSideBarDigital(config) {
    return `
        <div class="pin-info">
            <h4>Pin ${config.pin} - ${config.shortName}</h4>
            <p><strong>Type:</strong> ${config.outputType}</p>
            <p><strong>Original Label:</strong> ${config.originalLabel}</p>
        </div>
        
        <div class="form-group">
            <label>Digital Configuration:</label>
            <p>Digital configuration interface coming soon...</p>
        </div>
        
        <div class="sidebar-actions">
            <button onclick="saveAdvancedConfig(${config.pin})" class="btn-primary">Save Configuration</button>
            <button onclick="loadDefaultConfig()" class="btn-secondary">Load Defaults</button>
            <button onclick="validateConfig()" class="btn-secondary">Validate</button>
            <button onclick="exportARXML(${config.pin})" class="btn-export">Export ARXML</button>
        </div>
    `;
}