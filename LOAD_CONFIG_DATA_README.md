# Load Config Data Feature

## Overview
The "Load Config Data" feature allows users to import previously saved configuration data from JSON files back into the KR-CVO-IOConfig system. This enables easy backup, restore, and sharing of pin configurations.

## How to Use

### 1. Access the Feature
- Open the configuration viewer page: `src/function/configuration/configuration.html`
- Look for the green "Load Config Data" button in the header section

### 2. Load Configuration Data
1. Click the "Load Config Data" button
2. Select a JSON configuration file from your computer
3. The system will validate and display a confirmation dialog showing:
   - Number of DIO configurations to be loaded
   - Number of PWM configurations to be loaded
4. Click "OK" to proceed with loading or "Cancel" to abort

### 3. What Happens After Loading
- Configurations are loaded into localStorage
- The terminal diagram is updated (if available)
- The configuration list is refreshed
- A success message is displayed

## Supported File Format

The system expects JSON files with the following structure:

```json
{
  "generalSettings": {
    "lastUpdated": "2025-10-28T22:07:30.436Z",
    "version": "1.0",
    "autoSave": true,
    "loadDefaultsOnStart": false
  },
  "defaultConfigurations": {
    "DIO": { ... },
    "PWM": { ... }
  },
  "savedConfigurations": {
    "DIO": {
      "80": {
        "custSpecName": "O_S_RL05",
        "direction": "Output",
        "connectedTo": "TLE7244_0_80",
        // ... other DIO properties
      }
    },
    "PWM": {
      "15": {
        "custSpecName": "Motor_Speed_PWM",
        "frequency": "2000",
        "dutyCycle": "75",
        // ... other PWM properties
      }
    }
  }
}
```

## Features

### ✅ File Validation
- Checks for valid JSON format
- Validates file structure
- Ensures required sections exist

### ✅ Data Processing
- Handles both DIO and PWM configurations
- Maps configuration properties correctly
- Preserves timestamps and metadata

### ✅ Error Handling
- Clear error messages for invalid files
- Graceful handling of missing data
- User-friendly feedback

### ✅ Integration
- Updates localStorage for persistence
- Refreshes configuration display
- Attempts to update terminal diagram
- Compatible with existing export functions

## Technical Implementation

### Main Functions
- `loadConfigData()` - Triggers file selection dialog
- `handleConfigFileLoad(event)` - Processes selected file
- `loadConfigurationData(configData)` - Main loading logic
- `validateConfigurationData(configData)` - File validation
- `applyConfigurationData(configData)` - Applies configs to system

### Data Storage
- Uses localStorage for persistence
- Saves both array format and individual pin configs
- Maintains compatibility with existing system

### Error Handling
- Uses `displayError()` for consistent UI feedback
- `displaySuccessMessage()` for success notifications
- Console logging for debugging

## Usage Examples

### Example 1: Load DIO Configurations
```json
{
  "savedConfigurations": {
    "DIO": {
      "80": {
        "custSpecName": "Relay_Output_1",
        "direction": "Output",
        "connectedTo": "TLE7244_0_80"
      },
      "81": {
        "custSpecName": "Relay_Output_2", 
        "direction": "Output",
        "connectedTo": "TLE7244_0_81"
      }
    }
  }
}
```

### Example 2: Load Mixed Configurations
```json
{
  "savedConfigurations": {
    "DIO": {
      "80": { "custSpecName": "Digital_Out", "direction": "Output" }
    },
    "PWM": {
      "15": { "custSpecName": "Motor_PWM", "frequency": "2000", "dutyCycle": "75" }
    }
  }
}
```

## Benefits

1. **Backup & Restore** - Save and restore complete configurations
2. **Configuration Sharing** - Share setups between projects/teams
3. **Version Control** - Track configuration changes over time
4. **Quick Setup** - Rapidly deploy known-good configurations
5. **Data Migration** - Move configurations between systems

## File Locations

- Main feature: `src/function/configuration/configuration.html`
- JavaScript logic: `src/function/configuration/configuration.js`
- Data storage: `src/element/vd1cc055/data-storage.js`
- Demo page: `test_load_config_demo.html`

## Compatibility

- Works with existing export functions (Export JSON, Export CSV)
- Compatible with terminal diagram updates
- Integrates with current localStorage storage system
- Maintains backward compatibility with existing configurations