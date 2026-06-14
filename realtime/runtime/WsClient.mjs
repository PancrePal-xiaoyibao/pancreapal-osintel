import { dataBus as defaultDataBus } from "./DataBus.mjs";

const RECONNECT_BASE_MS = 5000;
const RECONNECT_MAX_MS = 60000;
const RECONNECT_JITTER_MS = 4000;
const STABLE_CONNECTION_MS = 5000;
const CLEANUP_GRACE_MS = 30000;

function normalizePluginId(pluginId) {
  return String(pluginId || "").replace(/_/g, "-");
}

function jitteredBackoff(attempt) {
  const base = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
  return base + Math.random() * RECONNECT_JITTER_MS;
}

function isFlatEntityArray(payload) {
  return Array.isArray(payload) && payload.every((item) => item && typeof item === "object" && !Array.isArray(item));
}

export class RealtimeWsClient {
  constructor({ bus = defaultDataBus, WebSocketImpl = globalThis.WebSocket } = {}) {
    if (!WebSocketImpl) {
      throw new Error("[WsClient] WebSocket implementation is required in this runtime");
    }
    this.bus = bus;
    this.WebSocketImpl = WebSocketImpl;
    this.engines = new Map();
  }

  subscribe(pluginId, engineUrl) {
    const normalizedPluginId = normalizePluginId(pluginId);
    const engine = this.getOrCreateEngine(engineUrl);
    if (engine.cleanupTimer) {
      clearTimeout(engine.cleanupTimer);
      engine.cleanupTimer = null;
    }
    engine.subscriptions.add(normalizedPluginId);
    this.connect(engineUrl);
    this.send(engine, { action: "subscribe", pluginId: normalizedPluginId });
  }

  unsubscribe(pluginId, engineUrl) {
    const normalizedPluginId = normalizePluginId(pluginId);
    const engine = this.engines.get(engineUrl);
    if (!engine) return;

    engine.subscriptions.delete(normalizedPluginId);
    this.send(engine, { action: "unsubscribe", pluginId: normalizedPluginId });

    if (engine.subscriptions.size === 0) {
      engine.cleanupTimer = setTimeout(() => {
        if (engine.subscriptions.size === 0) {
          engine.ws?.close();
          this.engines.delete(engineUrl);
        }
      }, CLEANUP_GRACE_MS);
    }
  }

  closeAll() {
    for (const engine of this.engines.values()) {
      if (engine.reconnectTimer) clearTimeout(engine.reconnectTimer);
      if (engine.stableTimer) clearTimeout(engine.stableTimer);
      if (engine.cleanupTimer) clearTimeout(engine.cleanupTimer);
      engine.ws?.close();
    }
    this.engines.clear();
  }

  getOrCreateEngine(engineUrl) {
    if (!this.engines.has(engineUrl)) {
      this.engines.set(engineUrl, {
        url: engineUrl,
        ws: null,
        subscriptions: new Set(),
        reconnectAttempt: 0,
        reconnectTimer: null,
        stableTimer: null,
        cleanupTimer: null
      });
    }
    return this.engines.get(engineUrl);
  }

  connect(engineUrl) {
    const engine = this.getOrCreateEngine(engineUrl);
    if (engine.ws && [this.WebSocketImpl.CONNECTING, this.WebSocketImpl.OPEN].includes(engine.ws.readyState)) {
      return;
    }

    const ws = new this.WebSocketImpl(engineUrl);
    engine.ws = ws;
    this.bus.emit("streamStatus", { engineUrl, status: "connecting" });

    ws.onopen = () => {
      this.bus.emit("streamStatus", { engineUrl, status: "open" });
      if (engine.stableTimer) clearTimeout(engine.stableTimer);
      engine.stableTimer = setTimeout(() => {
        engine.reconnectAttempt = 0;
      }, STABLE_CONNECTION_MS);
      for (const pluginId of engine.subscriptions) {
        this.send(engine, { action: "subscribe", pluginId });
      }
    };

    ws.onmessage = (event) => this.handleMessage(engineUrl, event.data);

    ws.onerror = (event) => {
      this.bus.emit("streamError", { engineUrl, error: event?.message || "websocket_error" });
    };

    ws.onclose = () => {
      this.bus.emit("streamStatus", { engineUrl, status: "closed" });
      engine.ws = null;
      if (engine.stableTimer) {
        clearTimeout(engine.stableTimer);
        engine.stableTimer = null;
      }
      if (engine.subscriptions.size === 0) return;

      const delay = jitteredBackoff(engine.reconnectAttempt);
      engine.reconnectAttempt += 1;
      engine.reconnectTimer = setTimeout(() => this.connect(engineUrl), delay);
      this.bus.emit("streamStatus", {
        engineUrl,
        status: "reconnecting",
        reconnectInMs: Math.round(delay)
      });
    };
  }

  handleMessage(engineUrl, rawMessage) {
    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch {
      this.bus.emit("streamError", { engineUrl, error: "invalid_json" });
      return;
    }

    if (message.type === "welcome") {
      this.bus.emit("streamStatus", { engineUrl, status: "welcome", plugins: message.plugins || [] });
      return;
    }

    if (message.type !== "data" || !message.pluginId) {
      this.bus.emit("streamError", { engineUrl, error: "unsupported_message", messageType: message.type });
      return;
    }

    const pluginId = normalizePluginId(message.pluginId);
    if (!isFlatEntityArray(message.payload)) {
      this.bus.emit("streamError", {
        engineUrl,
        pluginId,
        error: "payload_must_be_flat_realtime_geo_entity_array"
      });
      return;
    }

    this.bus.emit("dataUpdated", {
      pluginId,
      entities: message.payload
    });
  }

  send(engine, message) {
    if (engine.ws && engine.ws.readyState === this.WebSocketImpl.OPEN) {
      engine.ws.send(JSON.stringify(message));
    }
  }
}

export const wsClient = new RealtimeWsClient({ bus: defaultDataBus });
