# MMCC RV Thermostat — GitHub Pages Dashboard

This is a static browser dashboard for the ESP32 firmware
`MMCC_RV_Thermostat_Lite_v3_Remote_MQTT`.

It connects directly to HiveMQ Cloud using secure MQTT over WebSockets.

## Before uploading

Open `config.js` and replace:

```js
password: "PASTE_YOUR_REAL_MQTT_PASSWORD_HERE",
```

with the same HiveMQ password used in the ESP firmware.

## Security warning

GitHub Pages is public. Browser MQTT credentials placed in `config.js` can be
seen by anyone who can open the site or repository.

For better security, create a separate HiveMQ user for the dashboard and limit
that account to:

- Subscribe: `rv/thermostat/#`
- Publish: `rv/thermostat/command`

Do not give the dashboard user access to unrelated MQTT topics.

## Files

- `index.html` — page structure
- `style.css` — responsive styling
- `app.js` — MQTT connection, telemetry, and command buttons
- `config.js` — broker and login configuration
- `.nojekyll` — tells GitHub Pages to serve the files directly

## GitHub Pages setup

1. Create or open a GitHub repository.
2. Upload all files from this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save.
7. GitHub will show the site address after deployment.

## MQTT command

Topic:

```text
rv/thermostat/command
```

Payloads:

```text
PRESS
STATUS
REBOOT
```

## Telemetry topics

```text
rv/thermostat/online
rv/thermostat/temperature_f
rv/thermostat/humidity
rv/thermostat/chip_temperature_f
rv/thermostat/wifi_rssi
rv/thermostat/ip
rv/thermostat/uptime_seconds
rv/thermostat/free_heap_bytes
rv/thermostat/servo_state
rv/thermostat/servo_attached
rv/thermostat/button_presses
rv/thermostat/firmware
```

The dashboard uses the MQTT.js browser build from unpkg.
