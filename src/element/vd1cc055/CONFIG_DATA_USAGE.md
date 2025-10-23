# Pin Configuration Data Management System

## Overview
The terminal diagram now includes a comprehensive data management system that stores all user input configurations in a global array. This data can be easily accessed and reused in other HTML files.

## Global Data Storage Object

### `window.PinConfigurationManager`
A global object that manages all pin configuration data with the following methods:

#### Core Methods
- `addConfiguration(config)` - Add or update a pin configuration
- `getConfiguration(pinNumber)` - Get configuration for a specific pin
- `getAllConfigurations()` - Get all configurations as an array
- `getConfigurationsByType(outputType)` - Get configurations filtered by type (DIO, PWM, etc.)
- `removeConfiguration(pinNumber)` - Remove a specific pin configuration
- `clearAllConfigurations()` - Clear all configurations

#### Storage Methods
- `saveToStorage()` - Save configurations to localStorage
- `loadFromStorage()` - Load configurations from localStorage
- `exportConfigurations()` - Export all configurations as JSON string
- `importConfigurations(jsonString)` - Import configurations from JSON string

#### Utility Methods
- `getSummary()` - Get statistics about configurations

## Configuration Data Structure

Each pin configuration contains the following properties:

```javascript
{
    pin: "1",                    // Pin number (string)
    originalLabel: "O_T_1",      // Original pin label
    shortName: "MOTOR_PWM",      // User-defined short name
    outputType: "PWM",           // Output type: "DIO" or "PWM"
    pwmFrequency: 1000,          // PWM frequency in Hz (PWM only)
    pwmDutyCycle: 50,           // PWM duty cycle in % (PWM only)
    timestamp: "2024-10-22T...", // ISO timestamp of configuration
    configured: true             // Configuration status
}
```

## Global Utility Functions

### For Other HTML Files
```javascript
// Get all configuration data
const configs = window.getConfigurationData();

// Get configuration summary/statistics
const summary = window.getConfigurationSummary();

// Export configuration data as downloadable JSON file
window.exportConfigurationData();

// Import configuration data from JSON string
window.importConfigurationData(jsonString);

// Generate configuration data in different formats
const jsonData = window.generateConfigurationForExport('json');
const csvData = window.generateConfigurationForExport('csv');
const xmlData = window.generateConfigurationForExport('xml');
```

### Console Helper Functions
```javascript
// Display all configurations in console
window.showAllConfigurations();

// Display configurations by type
window.showConfigurationsByType('PWM');
window.showConfigurationsByType('DIO');
```

## Usage Examples

### Example 1: Basic Data Access
```javascript
// Get all PWM configurations
const pwmConfigs = window.PinConfigurationManager.getConfigurationsByType('PWM');

// Display PWM pins with their frequencies
pwmConfigs.forEach(config => {
    console.log(`Pin ${config.pin}: ${config.shortName} - ${config.pwmFrequency}Hz`);
});
```

### Example 2: Creating Configuration Reports
```javascript
// Get configuration summary
const summary = window.getConfigurationSummary();
console.log(`Total configured pins: ${summary.total}`);
console.log(`PWM pins: ${summary.byType.PWM || 0}`);
console.log(`DIO pins: ${summary.byType.DIO || 0}`);
```

### Example 3: Exporting Data for Other Applications
```javascript
// Export as CSV for Excel
const csvData = window.generateConfigurationForExport('csv');

// Export as XML for other systems
const xmlData = window.generateConfigurationForExport('xml');

// Export as JSON for web applications
const jsonData = window.generateConfigurationForExport('json');
```

## Data Persistence

The system uses two storage mechanisms:

1. **localStorage** - Individual pin configurations (legacy support)
   - Key format: `pin_config_${pinNumber}`
   - Individual JSON objects per pin

2. **Global Array Storage** - Centralized array storage (new system)
   - Key: `pin_configurations_array`
   - Single JSON array containing all configurations

## Integration with Other HTML Files

### Method 1: Direct Access (Same Domain)
```html
<script>
    // Access configuration data directly
    const configs = window.getConfigurationData();
    
    // Use the data to populate your interface
    configs.forEach(config => {
        // Create UI elements based on configuration
    });
</script>
```

### Method 2: Storage Event Listening
```html
<script>
    // Listen for configuration updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'pin_configurations_array') {
            // Reload configuration data
            loadConfigurations();
        }
    });
</script>
```

### Method 3: Periodic Refresh
```html
<script>
    // Automatically refresh data every 5 seconds
    setInterval(() => {
        const configs = window.getConfigurationData();
        updateDisplay(configs);
    }, 5000);
</script>
```

## Example Implementation

See `config-viewer.html` for a complete example of how to:
- Access configuration data
- Display configurations in a user-friendly format
- Export data in multiple formats
- Handle data updates and refresh automatically

## API Reference Summary

### Data Access
- `window.getConfigurationData()` → Array of all configurations
- `window.getConfigurationSummary()` → Statistics object
- `window.PinConfigurationManager.getConfiguration(pinNumber)` → Single configuration

### Data Export
- `window.exportConfigurationData()` → Download JSON file
- `window.generateConfigurationForExport(format)` → String in specified format

### Data Import
- `window.importConfigurationData(jsonString)` → Boolean success

### Console Helpers
- `window.showAllConfigurations()` → Console display of all configs
- `window.showConfigurationsByType(type)` → Console display by type

## Notes
- All functions are available globally via the `window` object
- Data persists across browser sessions via localStorage
- Configuration data is automatically cleared on page reload (as designed)
- The system is backward compatible with existing localStorage storage