const TLE7244_TEMPLATES = {
    main: `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://autosar.org/schema/r4.0 AUTOSAR_4-1-1.xsd">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>RB</SHORT-NAME>
      <AR-PACKAGES>
        <AR-PACKAGE>
          <SHORT-NAME>UBK</SHORT-NAME>
          <AR-PACKAGES>
            <AR-PACKAGE>
              <SHORT-NAME>Project</SHORT-NAME>
              <AR-PACKAGES>
                <AR-PACKAGE>
                  <SHORT-NAME>EcucModuleConfigurationValuess</SHORT-NAME>
                  <ELEMENTS>
                    <ECUC-MODULE-CONFIGURATION-VALUES>
                      <SHORT-NAME>rba_IoExtTle7244</SHORT-NAME>
                      <DEFINITION-REF DEST="ECUC-MODULE-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244</DEFINITION-REF>
                      <CONTAINERS>
                        <ECUC-CONTAINER-VALUE>
                          <SHORT-NAME>rba_IoExtTle7244_General</SHORT-NAME>
                          <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_General</DEFINITION-REF>
                          <PARAMETER-VALUES>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_General/rba_IoExtTle7244_DevErrorDetect</DEFINITION-REF>
                              <VALUE>true</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_General/rba_IoExtTle7244_DiagApi</DEFINITION-REF>
                              <VALUE>true</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_General/rba_IoExtTle7244_DioApi</DEFINITION-REF>
                              <VALUE>true</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_General/rba_IoExtTle7244_PwmApi</DEFINITION-REF>
                              <VALUE>true</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                            <ECUC-NUMERICAL-PARAM-VALUE>
                              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_General/rba_IoExtTle7244_VersionInfoApi</DEFINITION-REF>
                              <VALUE>true</VALUE>
                            </ECUC-NUMERICAL-PARAM-VALUE>
                          </PARAMETER-VALUES>
                        </ECUC-CONTAINER-VALUE>
                        <ECUC-CONTAINER-VALUE>
                          <SHORT-NAME>rba_IoExtTle7244_ConfigSet</SHORT-NAME>
                          <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_ConfigSet</DEFINITION-REF>
                          <SUB-CONTAINERS>
                            {{SIGNAL_CONTAINERS}}
                          </SUB-CONTAINERS>
                        </ECUC-CONTAINER-VALUE>
                        {{SIGNAL_REQUESTS}}
                      </CONTAINERS>
                    </ECUC-MODULE-CONFIGURATION-VALUES>
                  </ELEMENTS>
                </AR-PACKAGE>
              </AR-PACKAGES>
            </AR-PACKAGE>
          </AR-PACKAGES>
        </AR-PACKAGE>
      </AR-PACKAGES>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`,

signalContainerPwm:`<ECUC-CONTAINER-VALUE>
                              <SHORT-NAME>{{SIGNAL_NAME}}</SHORT-NAME>
                              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_ConfigSet/rba_IoExtTle7244_SignalPwm</DEFINITION-REF>
                              <PARAMETER-VALUES>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_ConfigSet/rba_IoExtTle7244_SignalPwm/rba_IoExtTle7244_ConnectedTo</DEFINITION-REF>
                                  <VALUE>{{EXT_CONNECTED_TO}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                              </PARAMETER-VALUES>
                            </ECUC-CONTAINER-VALUE>`,
signalContainerDio:`<ECUC-CONTAINER-VALUE>
                              <SHORT-NAME>{{SIGNAL_NAME}}</SHORT-NAME>
                              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_ConfigSet/rba_IoExtTle7244_SignalDio</DEFINITION-REF>
                              <PARAMETER-VALUES>
                                <ECUC-TEXTUAL-PARAM-VALUE>
                                  <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/RB/RBA/rba_IoExtTle7244/EcucModuleDefs/rba_IoExtTle7244/rba_IoExtTle7244_ConfigSet/rba_IoExtTle7244_SignalDio/rba_IoExtTle7244_ConnectedTo</DEFINITION-REF>
                                  <VALUE>{{EXT_CONNECTED_TO}}</VALUE>
                                </ECUC-TEXTUAL-PARAM-VALUE>
                              </PARAMETER-VALUES>
                            </ECUC-CONTAINER-VALUE>`,
signalRequest:``
};
