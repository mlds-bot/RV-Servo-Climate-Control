# MMCC RV Thermostat — Corrected GitHub Pages Dashboard

This version deliberately reuses the exact minimal MQTT connection pattern from
the previously working `MMCC Servo Climate` page.

## Important setup

Edit `config.js` and replace:

```js
const MQTT_PASS = "PASTE_YOUR_REAL_MQTT_PASSWORD_HERE";
```

with the working HiveMQ Cloud password.

## Servo safety behavior

The webpage does **not** move the servo itself. It only publishes one command:

```text
Topic: rv/thermostat/command
Payload: PRESS
```

The ESP firmware must remain responsible for:

1. Receiving the MQTT command and setting a request flag only.
2. Moving the servo from `loop()` through the non-blocking state machine.
3. Returning to the home position.
4. Waiting about 250 ms to settle.
5. Detaching the servo.
6. Continuing to call `mqtt.loop()` frequently during movement.

The webpage also includes a 10-second anti-double-click lockout. This is only an
extra browser safeguard; the ESP should still reject or queue commands while a
press cycle is active.

## GitHub Pages

Upload these files to the repository root:

- `index.html`
- `style.css`
- `app.js`
- `config.js`
- `.nojekyll`

Then enable GitHub Pages from the `main` branch and repository root.
