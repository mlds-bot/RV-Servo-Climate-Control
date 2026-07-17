MMCC RV Climate Controller — Servo Edition v1.0

FILES
-----
MMCC_RV_Climate_Servo_v1_0.ino
index.html
setup.html
diagnostics.html

GITHUB PAGES LAYOUT
-------------------
Keep your existing relay site untouched.

Suggested repository layout:

/
  index.html                 <- existing relay dashboard
  servo/
    index.html               <- servo everyday dashboard
    setup.html               <- calibration page
    diagnostics.html         <- recovery and troubleshooting

Your servo dashboard URL will then be:
https://YOUR-USER.github.io/YOUR-REPOSITORY/servo/

MQTT
----
The servo edition uses the separate topic tree:

rv/servo/...

The relay controller can remain on:

rv/ac/...

This prevents the two systems from controlling each other.

BEFORE UPLOADING
----------------
1. Replace MQTT_PASSWORD in the .ino.
2. Replace MQTT_PASS in all three HTML files.
3. Install the Arduino libraries listed at the top of the .ino.
4. Upload the .ino to the ESP32-S3.
5. Upload the three HTML files into /servo/ in GitHub.

TRAILER INSTALLATION
--------------------
1. Install the mechanism.
2. Open servo/setup.html.
3. Teach Home, Pre-Press, and Press.
4. Save the timing.
5. Use Exercise Servo to confirm clean movement.
6. Look at the thermostat display and select its real mode.
7. Open diagnostics.html and use Press Mode Once if you need to step through the cycle.
8. From the main page, test Start Cooling and Stop System.
9. Leave the thermostat and ESP synchronized in OFF.

COOLING VERIFICATION
--------------------
After Start Cooling, the ESP waits 20 minutes.

A temperature drop of 2°F or more:
COOLING_VERIFIED

Less than 2°F:
COOLING_NOT_VERIFIED

The warning is stored in Preferences and remains visible after reconnecting.
The firmware NEVER adds an automatic mode-button press.
