function generateSideBarPWM(config) {
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