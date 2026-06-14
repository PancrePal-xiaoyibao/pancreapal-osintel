import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SEEDERS_ROOT = join(PROJECT_ROOT, "realtime/seeders");
const SCHEMA_PATH = join(PROJECT_ROOT, "schemas/realtime-geo-entity.schema.json");

const PLUGIN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ENTITY_TYPES = new Set(["region", "country", "city", "center", "event", "trial", "source"]);
const LAYERS = new Set([
  "treatment-centers",
  "academic-activity",
  "trial-activity",
  "patient-pulse",
  "complication-support",
  "source-coverage",
  "breaking-events"
]);
const DATA_QUALITY = new Set(["public", "estimated", "mixed", "unverified"]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidDateTime(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isValidDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateEntity(entity, index, expectedPluginId) {
  const errors = [];
  const path = `entity[${index}]`;

  if (!isObject(entity)) return [`${path} must be an object`];

  const required = ["id", "pluginId", "entityType", "latitude", "longitude", "timestamp", "label", "source"];
  for (const field of required) {
    if (!(field in entity)) errors.push(`${path}.${field} is required`);
  }

  const allowed = new Set([
    "id",
    "pluginId",
    "entityType",
    "latitude",
    "longitude",
    "altitude",
    "timestamp",
    "label",
    "layer",
    "heat",
    "dataQuality",
    "source",
    "properties"
  ]);
  for (const key of Object.keys(entity)) {
    if (!allowed.has(key)) errors.push(`${path}.${key} is not part of RealtimeGeoEntity`);
  }

  if (typeof entity.id !== "string" || entity.id.length === 0) errors.push(`${path}.id must be a non-empty string`);
  if (!PLUGIN_ID_PATTERN.test(entity.pluginId || "")) errors.push(`${path}.pluginId must be kebab-case`);
  if (entity.pluginId !== expectedPluginId) {
    errors.push(`${path}.pluginId must match seeder name "${expectedPluginId}"`);
  }
  if (!ENTITY_TYPES.has(entity.entityType)) errors.push(`${path}.entityType is invalid`);
  if (typeof entity.latitude !== "number" || entity.latitude < -90 || entity.latitude > 90) {
    errors.push(`${path}.latitude must be a number in [-90, 90]`);
  }
  if (typeof entity.longitude !== "number" || entity.longitude < -180 || entity.longitude > 180) {
    errors.push(`${path}.longitude must be a number in [-180, 180]`);
  }
  if ("altitude" in entity && typeof entity.altitude !== "number") errors.push(`${path}.altitude must be a number`);
  if (!isValidDateTime(entity.timestamp)) errors.push(`${path}.timestamp must be an ISO date-time string`);
  if (typeof entity.label !== "string" || entity.label.length === 0) errors.push(`${path}.label must be a non-empty string`);
  if ("layer" in entity && !LAYERS.has(entity.layer)) errors.push(`${path}.layer is invalid`);
  if ("heat" in entity && (typeof entity.heat !== "number" || entity.heat < 0 || entity.heat > 100)) {
    errors.push(`${path}.heat must be a number in [0, 100]`);
  }
  if ("dataQuality" in entity && !DATA_QUALITY.has(entity.dataQuality)) {
    errors.push(`${path}.dataQuality is invalid`);
  }

  if (!isObject(entity.source)) {
    errors.push(`${path}.source must be an object`);
  } else {
    const allowedSource = new Set(["type", "url", "accessedAt", "verificationStatus"]);
    for (const key of Object.keys(entity.source)) {
      if (!allowedSource.has(key)) errors.push(`${path}.source.${key} is not part of source metadata`);
    }
    if (typeof entity.source.type !== "string" || entity.source.type.length === 0) {
      errors.push(`${path}.source.type must be a non-empty string`);
    }
    if (!isValidUrl(entity.source.url)) errors.push(`${path}.source.url must be an http(s) URL`);
    if (!isValidDate(entity.source.accessedAt)) errors.push(`${path}.source.accessedAt must be YYYY-MM-DD`);
    if ("verificationStatus" in entity.source && typeof entity.source.verificationStatus !== "string") {
      errors.push(`${path}.source.verificationStatus must be a string`);
    }
  }

  if ("properties" in entity && !isObject(entity.properties)) {
    errors.push(`${path}.properties must be an object when present`);
  }

  return errors;
}

async function findSeeders(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const seeders = [];
  for (const entry of entries) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      seeders.push(...(await findSeeders(fullPath)));
    } else if (entry.isFile() && entry.name === "seeder.mjs") {
      seeders.push(fullPath);
    }
  }
  return seeders.sort();
}

async function validateSeeder(seederPath) {
  const mod = await import(pathToFileURL(seederPath).href);
  const seeder = mod.default;
  const label = seederPath.replace(`${PROJECT_ROOT}/`, "");
  const errors = [];

  if (!isObject(seeder)) {
    return { label, count: 0, errors: ["default export must be an object"] };
  }
  if (!PLUGIN_ID_PATTERN.test(seeder.name || "")) errors.push("default.name must be kebab-case");
  if (typeof seeder.interval !== "number" || seeder.interval <= 0) {
    errors.push("default.interval must be a positive number");
  }
  if (typeof seeder.fetch !== "function") errors.push("default.fetch must be a function");
  if (errors.length > 0) return { label, count: 0, errors };

  const rows = await seeder.fetch();
  if (!Array.isArray(rows)) {
    return { label, count: 0, errors: ["fetch() must return RealtimeGeoEntity[]"] };
  }

  const ids = new Set();
  rows.forEach((row, index) => {
    errors.push(...validateEntity(row, index, seeder.name));
    if (row && typeof row.id === "string") {
      if (ids.has(row.id)) errors.push(`entity[${index}].id duplicates "${row.id}"`);
      ids.add(row.id);
    }
  });

  return { label, count: rows.length, errors };
}

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));
  if (schema.title !== "Realtime Geo Entity") {
    throw new Error(`Unexpected realtime schema title: ${schema.title}`);
  }

  const seeders = await findSeeders(SEEDERS_ROOT);
  if (seeders.length === 0) {
    throw new Error(`No seeder.mjs files found under ${SEEDERS_ROOT}`);
  }

  const results = [];
  for (const seederPath of seeders) {
    results.push(await validateSeeder(seederPath));
  }

  const failures = results.filter((result) => result.errors.length > 0);
  for (const result of results) {
    const status = result.errors.length === 0 ? "ok" : "failed";
    console.log(`${status} ${result.label} entities=${result.count}`);
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
