MMCC RV CLIMATE CONTROLLER — SERVO EDITION v1.0
================================================

PACKAGE CONTENTS
----------------
MMCC_RV_Climate_Servo_v1_0.ino
index.html
setup.html
diagnostics.html
shared.js
style.css

BEFORE FLASHING
---------------
1. Enter the HiveMQ password in MQTT_PASSWORD in the .ino file.
2. Disconnect the relay module from GPIO1 before running servo firmware.
   Servo PWM can make a mechanical relay chatter.
3. Power the servo from a suitable 5 V supply and connect the ESP32 and
   servo grounds together.
4. Confirm the thermostat cycle is OFF -> FAN -> COOL -> HEAT -> OFF.

ARDUINO LIBRARIES
-----------------
WiFiManager by tzapu
PubSubClient by Nick O'Leary
DHT sensor library by Adafruit
Adafruit Unified Sensor
Adafruit NeoPixel
ESP32Servo

WEB PAGES
---------
The pages use secure MQTT WebSockets, normally port 8884. MQTT settings are
stored in the browser's localStorage. The default base topic is rv/servo.

RGB LED
-------
Profiles are independently configurable for color and flash interval:
READY, FAN, COOL, HEAT, PENDING, WARNING, SYNC, MOVING, WIFI, MQTT, DHT.

Flash interval 0 means solid. Overall brightness is shared by all profiles.
Commands use rv/servo/led/command:
SET,PROFILE,R,G,B,FLASH_MS
BRIGHTNESS,VALUE
TEST,R,G,B,BRIGHTNESS,FLASH_MS
AUTO
STATUS

SAFETY
------
Cooling verification waits 20 minutes and requires a 2.0 F drop. A failure
latches COOLING_NOT_VERIFIED. Verification never causes another servo press.
