const KNOWN_EVENTS = new Set(["dataUpdated", "cameraPreset", "streamStatus", "streamError"]);

export class DataBus {
  constructor({ strict = true } = {}) {
    this.strict = strict;
    this.listeners = new Map();
  }

  on(eventName, handler) {
    this.assertEvent(eventName);
    if (typeof handler !== "function") {
      throw new TypeError(`[DataBus] handler for "${eventName}" must be a function`);
    }
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    this.listeners.get(eventName)?.delete(handler);
  }

  emit(eventName, payload) {
    this.assertEvent(eventName);
    for (const handler of this.listeners.get(eventName) || []) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[DataBus] handler failed for "${eventName}"`, error);
      }
    }
  }

  clear(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  assertEvent(eventName) {
    if (this.strict && !KNOWN_EVENTS.has(eventName)) {
      throw new Error(`[DataBus] unknown event "${eventName}"`);
    }
  }
}

export const dataBus = new DataBus();
