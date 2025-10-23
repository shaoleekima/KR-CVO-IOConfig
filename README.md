# DIO Configuration Generator

A web-based tool for generating AUTOSAR DIO signal configuration files using customizable templates.

## Features

- ✅ Interactive form for DIO signal configuration
- ✅ Real-time validation with error and warning messages
- ✅ Template-based ARXML generation
- ✅ Uses external template files for flexibility
- ✅ Object-oriented JavaScript architecture
- ✅ Responsive design for desktop and mobile
- ✅ Professional UI/UX with modern styling

## Project Structure

```
Project_B/
├── src/
│   └── function/
│       └── dio/
│           ├── dio.html          # Main UI interface
│           ├── dio.css           # Styling and responsive design
│           └── dio.js            # Core application logic
├── template/
│   └── dio/
│       ├── rba_IoSigDio_EcuValues_temp.arxml      # Main ARXML template
│       ├── signal_container_template.txt           # Signal container template
│       └── signal_request_template.txt             # Signal request template
└── lib/                          # Library files and configurations
```

## How to Run

### Option 1: Using VS Code Live Server (Recommended)

1. Install the "Live Server" extension in VS Code
2. Right-click on `src/function/dio/dio.html`
3. Select "Open with Live Server"
4. The application will open in your browser

### Option 2: Using Node.js HTTP Server

1. Install Node.js if not already installed
2. Open terminal in the project root directory
3. Run: `npx http-server . -p 8080`
4. Open browser and navigate to: `http://localhost:8080/src/function/dio/dio.html`

### Option 3: Using Python HTTP Server

1. Open terminal in the project root directory
2. Run: `python -m http.server 8080` (Python 3) or `python -m SimpleHTTPServer 8080` (Python 2)
3. Open browser and navigate to: `http://localhost:8080/src/function/dio/dio.html`

## Usage Instructions

1. **Fill in Required Fields** (marked with *):
   - Signal Name: Unique identifier for the DIO signal
   - Connected To: Physical pin or port connection
   - Direction: Input, Output, or Input/Output
   - Initial State: High, Low, or No Init
   - Initialization Strategy: Direct, Delayed, or On Request

2. **Configure Optional Fields**:
   - Customer Specification Name
   - Calibration Alternative Text
   - Boolean options (checkboxes)

3. **Validate Configuration**:
   - Click "Validate Configuration" to check for errors and warnings
   - Fix any errors before proceeding

4. **Generate ARXML**:
   - Click "Generate ARXML" to download the configuration file
   - File will be saved as `{SignalName}_config.arxml`

## Template System

The application uses three template files:

- **Main Template**: `rba_IoSigDio_EcuValues_temp.arxml` - Complete AUTOSAR XML structure
- **Signal Container**: `signal_container_template.txt` - Signal configuration block
- **Signal Request**: `signal_request_template.txt` - Signal request block

Templates use placeholder syntax: `{{PLACEHOLDER_NAME}}`

### Supported Placeholders

- `{{SIGNAL_NAME}}` - Signal identifier
- `{{CUST_SPEC_NAME}}` - Customer specification name
- `{{CONNECTED_TO}}` - Physical connection
- `{{DIRECTION}}` - Input/Output/InputOutput
- `{{DIRECTION_CHANGEABLE}}` - true/false
- `{{INVERT}}` - true/false
- `{{CALIBRATABLE}}` - true/false
- `{{CALIBRATABLE_INVERT}}` - true/false
- `{{INIT_STATE}}` - High/Low/NoInit
- `{{INIT_STRATEGY}}` - Direct/Delayed/OnRequest
- `{{OUT_DIAG_CURRENT}}` - true/false
- `{{OUT_PROTECT_STRATEGY_PARAM}}` - Optional protection parameter
- `{{CALIB_ALTER_TEXT}}` - Calibration alternative text

## Validation Rules

- Signal names must start with a letter and contain only letters, numbers, and underscores
- All required fields must be filled
- Logic validation (e.g., input signals don't need output-specific options)
- Dependency checks (e.g., calibratable invert requires calibratable to be enabled)

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Templates Not Loading

If you see a "Failed to Load Templates" error:

1. Ensure you're running a local HTTP server (not opening HTML file directly)
2. Check that template files exist in the `template/dio/` directory
3. Verify file paths are correct
4. Check browser console for detailed error messages

### CORS Errors

If you see CORS-related errors:
- Use one of the recommended HTTP server methods above
- Don't open the HTML file directly in the browser (`file://` protocol)

## Development

The application is built with:
- **Vanilla JavaScript** (ES6+) with Object-Oriented Programming
- **Modern CSS** with CSS Grid and Flexbox
- **Fetch API** for template loading
- **Blob API** for file downloads
- **No external dependencies** for maximum compatibility

### Code Structure

- `DIOConfigGenerator` class handles all application logic
- Template loading with fallback path detection
- Comprehensive validation system
- Professional error handling and user feedback
 