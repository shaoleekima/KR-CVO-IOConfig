# TLE7244 Title Block & Output Folder Guide

## 🏷️ **TLE7244 Title Block**

### Overview
The TLE7244 terminal diagram now includes a professional title block that clearly identifies the component.

### Features
- **Title**: "TLE7244 - Power Switch IC"
- **Subtitle**: "8-Channel High Side Switch with SPI Interface"
- **Professional Design**: Blue gradient background with shadow effects
- **Visibility**: Only appears when "Expand Width" button is clicked
- **Responsive**: Adapts to different screen sizes

### How to View
1. Open the terminal diagram (`src/element/vd1cc055/termaildiagram.html`)
2. Click the **"Expand Width"** button in the filter panel
3. The TLE7244 block will appear with the title at the top

### Styling Details
```css
.tle7244-title {
    text-align: center;
    background: linear-gradient(135deg, #007acc 0%, #005a99 100%);
    border-radius: 8px;
    color: white;
    box-shadow: 0 4px 8px rgba(0, 122, 204, 0.3);
}
```

## 📁 **Output Folder for All Exports**

### Overview
All export and generate functions now suggest saving files to an "output/" folder for better organization.

### Affected Export Functions

#### 1. **Configuration Exports**
- **CSV Export**: `output/pin_configurations_2025-10-29.csv`
- **JSON Export**: `output/pin_configurations_2025-10-29.json`

#### 2. **ARXML Exports**
- **Single Pin**: `output/TLE7244_DIO_Pin81_Config.arxml`
- **Extended Config**: `output/TLE7244_DIO_Ext_Config.arxml`

#### 3. **Data Storage Exports**
- **Config Data**: `output/kr_cvo_config_2025-10-29.json`

### How It Works

#### Browser Download Behavior
- Browser will suggest `output/` as part of the filename
- User can choose to save directly or navigate to existing output folder
- Maintains file organization and prevents desktop clutter

#### Implementation
```javascript
// Helper function used across all modules
function generateOutputFilename(baseFilename) {
    return `output/${baseFilename}`;
}

// Example usage
a.download = generateOutputFilename(`pin_configurations_${date}.csv`);
```

### Files Modified
1. **`src/function/configuration/configuration.js`**
   - CSV export function
   - ARXML export functions
   - Added `generateOutputFilename()` helper

2. **`src/element/vd1cc055/terminaldiagram.js`**
   - JSON configuration export
   - Added `generateOutputFilename()` helper

3. **`src/element/vd1cc055/data-storage.js`**
   - Data download function
   - Added `generateOutputFilename()` method

4. **`src/function/libs/bsw/file_downloader.js`**
   - Enhanced FileDownloader class
   - Automatic output folder prefix for all downloads

### User Instructions

#### Recommended Workflow
1. **Create Output Folder**: Create an `output/` folder in your project directory
2. **Export Data**: Use any export function (JSON, CSV, ARXML)
3. **Save to Output**: Browser will suggest the output folder
4. **Organized Files**: All generated files will be in one location

#### File Organization Example
```
KR-CVO-IOConfig/
├── output/
│   ├── pin_configurations_2025-10-29.csv
│   ├── pin_configurations_2025-10-29.json
│   ├── TLE7244_DIO_Pin81_Config.arxml
│   ├── TLE7244_DIO_Pin82_Config.arxml
│   └── kr_cvo_config_2025-10-29.json
├── src/
└── ...
```

## 🎯 **Benefits**

### TLE7244 Title Block
- **Clear Identification**: Immediately know which IC is being configured
- **Professional Appearance**: Clean, branded interface
- **Context Awareness**: Only visible when needed (expand mode)

### Output Folder Organization
- **File Management**: All exports in one organized location
- **Prevent Clutter**: No more scattered files in download folder
- **Team Collaboration**: Consistent file organization across team members
- **Version Control**: Easy to include/exclude output files from git

## 🚀 **Usage Examples**

### Example 1: Export Configuration Data
1. Configure some pins in the terminal diagram
2. Open configuration viewer
3. Click "Export JSON" or "Export CSV"
4. Browser suggests: `output/pin_configurations_2025-10-29.json`
5. Save to your project's output folder

### Example 2: Generate ARXML Files
1. Configure a DIO pin
2. Use export functions
3. Browser suggests: `output/TLE7244_DIO_Pin81_Config.arxml`
4. File saved to organized output location

### Example 3: View TLE7244 Details
1. Open terminal diagram
2. Click "Expand Width" button
3. See professional TLE7244 title block
4. Configure pins with clear component identification

## 🔧 **Technical Details**

### Browser Compatibility
- Works with all modern browsers
- Chrome, Firefox, Edge, Safari support
- Filename suggestion follows browser standards

### File Naming Convention
- **Timestamps**: ISO date format (YYYY-MM-DD)
- **Identifiers**: Clear pin numbers and types
- **Extensions**: Standard file extensions (.json, .csv, .arxml)
- **Prefix**: Consistent "output/" folder suggestion

### Customization
Developers can modify the output folder name by updating the `generateOutputFilename()` function:

```javascript
function generateOutputFilename(baseFilename) {
    return `generated/${baseFilename}`;  // Use "generated" instead of "output"
}
```

Both features are now live on the **NLU3HC branch** and ready for use!