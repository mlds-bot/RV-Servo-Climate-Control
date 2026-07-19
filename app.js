let client;
let lastEsp = 0;
let pressLocked = false;

const $ = id => document.getElementById(id);

function stamp() {
  return new Date().toLocaleTimeString();
}

function log(message) {
  const row = document.createElement("div");
  row.textContent = stamp() + "  " + message;
  $("log").prepend(row);
}

function setMqtt(online) {
  $("mqttDot").className = online ? "dot good" : "dot";
  $("mqttText").textContent = online ? "MQTT Online" : "MQTT Offline";
  updatePressButton();
}

function setEsp(online) {
  $("espDot").className = online ? "dot good" : "dot";
  $("espText").textContent = online ? "ESP Online" : "ESP Offline";
  updatePressButton();
}

function updatePressButton() {
  const mqttOnline = Boolean(client && client.connected);
  const espOnline = lastEsp && (Date.now() - lastEsp < 90000);
  $("pressBtn").disabled = !mqttOnline || !espOnline || pressLocked;
}

function fmtUptime(seconds) {
  seconds = Number(seconds);
  if (!Number.isFinite(seconds)) return "--";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

function sendCommand(command) {
  if (!client || !client.connected) {
    log("MQTT not connected");
    return;
  }

  client.publish(`${BASE}/command`, command, {qos: 1}, error => {
    if (error) log("Publish failed: " + error.message);
    else log("Sent: " + command);
  });
}

function pressThermostat() {
  if (pressLocked) return;
  if (!confirm("Press the physical thermostat button once?")) return;

  // Browser-side anti-double-click guard.
  // The ESP still controls the actual non-blocking servo state machine.
  pressLocked = true;
  updatePressButton();
  sendCommand("PRESS");
  log("PRESS request sent; waiting before another request is allowed");

  setTimeout(() => {
    pressLocked = false;
    updatePressButton();
  }, 10000);
}

function rebootEsp() {
  if (confirm("Reboot the ESP32 now?")) sendCommand("REBOOT");
}

function connect() {
  // This is intentionally the same minimal, proven connection pattern
  // used by the user's original working MMCC dashboard.
  client = mqtt.connect(MQTT_URL, {
    username: MQTT_USER,
    password: MQTT_PASS,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 10000,
    clientId: "mmcc_thermostat_" + Math.random().toString(16).slice(2)
  });

  client.on("connect", () => {
    setMqtt(true);
    client.subscribe(`${BASE}/#`, {qos: 1});
    sendCommand("STATUS");
    log("MQTT connected");
  });

  client.on("close", () => {
    setMqtt(false);
  });

  client.on("error", error => {
    log("MQTT error: " + error.message);
  });

  client.on("message", (topic, payload) => {
    handle(topic.replace(BASE + "/", ""), payload.toString());
  });
}

function handle(sub, msg) {
  $("updated").textContent = stamp();

  if (sub === "online") {
    if (msg === "online") {
      lastEsp = Date.now();
      setEsp(true);
    } else {
      lastEsp = 0;
      setEsp(false);
    }
  } else if (sub === "temperature_f") {
    $("temp").textContent = msg.trim() ? Number(msg).toFixed(1) : "--";
  } else if (sub === "humidity") {
    $("humidity").textContent = msg.trim() ? Number(msg).toFixed(1) : "--";
  } else if (sub === "chip_temperature_f") {
    $("chipTemp").textContent = msg.trim() ? Number(msg).toFixed(1) + " °F" : "-- °F";
  } else if (sub === "wifi_rssi") {
    $("rssi").textContent = msg + " dBm";
  } else if (sub === "uptime_seconds") {
    $("uptime").textContent = fmtUptime(msg);
  } else if (sub === "free_heap_bytes") {
    const bytes = Number(msg);
    $("heap").textContent = Number.isFinite(bytes) ? (bytes / 1024).toFixed(1) + " KB" : "-- KB";
  } else if (sub === "ip") {
    $("ip").textContent = msg;
  } else if (sub === "servo_state") {
    $("servoState").textContent = msg.replaceAll("_", " ");
  } else if (sub === "servo_attached") {
    $("servoAttached").textContent = msg.toLowerCase() === "true" ? "Yes" : "No";
  } else if (sub === "button_presses") {
    $("pressCount").textContent = msg;
  } else if (sub === "firmware") {
    $("firmware").textContent = msg;
  } else if (sub === "status") {
    log("Status: " + msg.replaceAll("_", " "));
  }
}

setInterval(() => {
  if (lastEsp && Date.now() - lastEsp > 90000) {
    lastEsp = 0;
    setEsp(false);
  }
}, 5000);

connect();
