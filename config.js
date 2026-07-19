/*
  MMCC RV Thermostat GitHub Pages configuration

  IMPORTANT:
  1. Enter the same HiveMQ Cloud password used by the ESP firmware.
  2. GitHub Pages is public. Anyone who can view this file can view the
     browser MQTT credentials. Create a limited HiveMQ user specifically
     for this dashboard whenever possible.
*/

window.THERMOSTAT_CONFIG = {
  brokerHost: "b1dcdceb082d4443873bb186cd006f90.s1.eu.hivemq.cloud",
  websocketPort: 8884,
  websocketPath: "/mqtt",
  username: "MLDS_CHAT2",
  password: "Tonka123",
  topicRoot: "rv/thermostat"
};
