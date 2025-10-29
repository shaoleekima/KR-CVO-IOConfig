function generateSideBarDio(config) {
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