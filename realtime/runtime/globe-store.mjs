function normalizePluginId(pluginId) {
  return String(pluginId || "").replace(/_/g, "-");
}

export class GlobeStore {
  constructor() {
    this.entitiesByPlugin = new Map();
    this.selectedEntityId = null;
    this.lastUpdatedAt = null;
  }

  upsertPluginEntities(pluginId, entities) {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!Array.isArray(entities)) {
      throw new TypeError("[GlobeStore] entities must be an array");
    }

    const byId = new Map(this.entitiesByPlugin.get(normalizedPluginId) || []);
    for (const entity of entities) {
      byId.set(entity.id, entity);
    }
    this.entitiesByPlugin.set(normalizedPluginId, byId);
    this.lastUpdatedAt = new Date().toISOString();
    return byId.size;
  }

  replacePluginEntities(pluginId, entities) {
    const normalizedPluginId = normalizePluginId(pluginId);
    const byId = new Map();
    for (const entity of entities) {
      byId.set(entity.id, entity);
    }
    this.entitiesByPlugin.set(normalizedPluginId, byId);
    this.lastUpdatedAt = new Date().toISOString();
    return byId.size;
  }

  getPluginEntities(pluginId) {
    const normalizedPluginId = normalizePluginId(pluginId);
    return Array.from(this.entitiesByPlugin.get(normalizedPluginId)?.values() || []);
  }

  getAllEntities() {
    return Array.from(this.entitiesByPlugin.values()).flatMap((items) => Array.from(items.values()));
  }

  bind(bus) {
    return bus.on("dataUpdated", ({ pluginId, entities }) => {
      this.upsertPluginEntities(pluginId, entities);
    });
  }
}

export const globeStore = new GlobeStore();
