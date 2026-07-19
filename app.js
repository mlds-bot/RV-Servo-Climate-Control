(() => {
  "use strict";

  const cfg = window.THERMOSTAT_CONFIG;
  const $ = (id) => document.getElementById(id);

  if (!cfg || typeof mqtt === "undefined") {
    $("actionStatus").textContent = "Configuration or MQTT library failed to load.";
    return;
  }

  const clientId = `mmcc-web-${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const brokerUrl = `wss://${cfg.brokerHost}:${cfg.websocketPort}${cfg.websocketPath}`;

  $("brokerHost").textContent = brokerUrl;
  $("clientId").textContent = clientId;
  $("topicRoot").textContent = cfg.topicRoot;

  const fields = {
    [`${cfg.topicRoot}/temperature_f`]: ["temperature", formatNumber],
    [`${cfg.topicRoot}/humidity`]: ["humidity", formatNumber],
    [`${cfg.topicRoot}/chip_temperature_f`]: ["chipTemp", formatNumber],
    [`${cfg.topicRoot}/wifi_rssi`]: ["rssi", plain],
    [`${cfg.topicRoot}/servo_state`]: ["servoState", plain],
    [`${cfg.topicRoot}/servo_attached`]: ["servoAttached", yesNo],
    [`${cfg.topicRoot}/button_presses`]: ["pressCount", plain],
    [`${cfg.topicRoot}/uptime_seconds`]: ["uptime", formatUptime],
    [`${cfg.topicRoot}/free_heap_bytes`]: ["heap", bytesToKb],
    [`${cfg.topicRoot}/ip`]: ["ip", plain],
    [`${cfg.topicRoot}/firmware`]: ["firmware", plain]
  };

  function plain(value) {
    return value;
  }

  function formatNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : "--";
  }

  function yesNo(value) {
    return String(value).toLowerCase() === "true" ? "Yes" : "No";
  }

  function bytesToKb(value) {
    const n = Number(value);
    return Number.isFinite(n) ? (n / 1024).toFixed(1) : "--";
  }

  function formatUptime(value) {
    let seconds = Number(value);
    if (!Number.isFinite(seconds)) return "--";

    seconds = Math.max(0, Math.floor(seconds));
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function setBadge(el, onlineText, offlineText, online) {
    el.textContent = online ? onlineText : offlineText;
    el.classList.toggle("online", online);
    el.classList.toggle("offline", !online);
  }

  function setControlsEnabled(enabled) {
    $("pressBtn").disabled = !enabled;
    $("statusBtn").disabled = !enabled;
    $("rebootBtn").disabled = !enabled;
  }

  function publishCommand(command) {
    if (!client.connected) {
      $("actionStatus").textContent = "MQTT is not connected.";
      return;
    }

    client.publish(
      `${cfg.topicRoot}/command`,
      command,
      { qos: 1, retain: false },
      (err) => {
        $("actionStatus").textContent = err
          ? `Command failed: ${err.message}`
          : `${command} command sent.`;
      }
    );
  }

  const client = mqtt.connect(brokerUrl, {
    clientId,
    username: cfg.username,
    password: cfg.password,
    clean: true,
    reconnectPeriod: 4000,
    connectTimeout: 12000,
    keepalive: 30,
    protocolVersion: 4
  });

  setControlsEnabled(false);

  client.on("connect", () => {
    setBadge($("brokerBadge"), "MQTT connected", "MQTT disconnected", true);
    setControlsEnabled(true);
    $("actionStatus").textContent = "Connected. Requesting current status.";

    client.subscribe(`${cfg.topicRoot}/#`, { qos: 1 }, (err) => {
      if (err) {
        $("actionStatus").textContent = `Subscription failed: ${err.message}`;
        return;
      }
      publishCommand("STATUS");
    });
  });

  client.on("reconnect", () => {
    setBadge($("brokerBadge"), "MQTT connected", "MQTT reconnecting", false);
    setControlsEnabled(false);
    $("actionStatus").textContent = "Reconnecting to MQTT…";
  });

  client.on("close", () => {
    setBadge($("brokerBadge"), "MQTT connected", "MQTT disconnected", false);
    setControlsEnabled(false);
  });

  client.on("error", (err) => {
    $("actionStatus").textContent = `MQTT error: ${err.message}`;
  });

  client.on("message", (topic, payload) => {
    const value = payload.toString();
    $("lastUpdate").textContent = new Date().toLocaleString();

    if (topic === `${cfg.topicRoot}/online`) {
      const online = value.toLowerCase() === "online";
      setBadge($("deviceBadge"), "Device online", `Device ${value || "offline"}`, online);
      return;
    }

    const mapping = fields[topic];
    if (!mapping) return;

    const [elementId, formatter] = mapping;
    $(elementId).textContent = formatter(value);
  });

  $("pressBtn").addEventListener("click", () => {
    publishCommand("PRESS");
  });

  $("statusBtn").addEventListener("click", () => {
    publishCommand("STATUS");
  });

  $("rebootBtn").addEventListener("click", () => {
    const confirmed = window.confirm("Reboot the thermostat ESP now?");
    if (confirmed) publishCommand("REBOOT");
  });
})();
