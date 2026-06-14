import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const schema = JSON.parse(await readFile("schemas/app-configuration.schema.json", "utf8"));
const config = JSON.parse(await readFile("data/config/demo_app_config.json", "utf8"));

const topLevelSurfaces = [
  "modelProviders",
  "ragConnectors",
  "sourceFilters",
  "wechatMonitor",
  "translation",
  "patientLocalProfile",
  "savedCenters",
  "elderlyMode",
  "pinGate",
  "reportSafety"
];

assert.equal(schema.title, "App Configuration");
assert.deepEqual(schema.required, topLevelSurfaces);

for (const surface of topLevelSurfaces) {
  assert.ok(Object.hasOwn(schema.properties, surface), `schema missing ${surface}`);
  assert.ok(Object.hasOwn(config, surface), `config missing ${surface}`);
}

assert.ok(Array.isArray(config.modelProviders));
assert.ok(Array.isArray(config.ragConnectors));
assert.ok(config.sourceFilters);
assert.ok(config.reportSafety);

for (const connector of config.ragConnectors) {
  assert.ok(Object.hasOwn(connector, "status"), `connector ${connector.connectorKey} missing status`);
  assert.ok(Object.hasOwn(connector, "lastTestedAt"), `connector ${connector.connectorKey} missing lastTestedAt`);
  assert.ok(Object.hasOwn(connector, "diagnostics"), `connector ${connector.connectorKey} missing diagnostics`);
}

const serializedConfig = JSON.stringify(config);
const forbiddenMpTextKey = ["99e5afd000894880", "83247a4c7e350e77"].join("");
const forbiddenSupabaseSecretPrefix = ["sb", "_secret_"].join("");
assert.ok(!serializedConfig.includes(forbiddenMpTextKey));
assert.ok(!serializedConfig.includes(forbiddenSupabaseSecretPrefix));
assert.ok(!serializedConfig.includes("sk-"));

const placeholderPattern = /^PLACEHOLDER_[A-Z0-9_]+$/;
const envRefPattern = /^[A-Z][A-Z0-9_]*$/;

function assertSecretRef(secretRef, label) {
  if (secretRef.kind === "placeholder") {
    assert.match(secretRef.value, placeholderPattern, `${label} placeholder must use PLACEHOLDER_*`);
    return;
  }
  if (secretRef.kind === "env") {
    assert.match(secretRef.value, envRefPattern, `${label} env ref must be an env var name`);
    return;
  }
  assert.fail(`${label} secret kind is unsupported`);
}

for (const provider of config.modelProviders) {
  assertSecretRef(provider.apiKey, `provider ${provider.providerKey}`);
}

assertSecretRef(config.wechatMonitor.apiKey, "wechat monitor");
assert.ok(config.wechatMonitor.pollIntervalMinutes >= 60);
assert.ok(config.wechatMonitor.pollIntervalMinutes <= 10080);

for (const connector of config.ragConnectors) {
  assertSecretRef(connector.apiKey, `connector ${connector.connectorKey}`);
  assert.ok(connector.diagnostics && typeof connector.diagnostics === "object");
  assert.ok(["info", "warning", "error"].includes(connector.diagnostics.severity));
  assert.ok(Object.hasOwn(connector.diagnostics, "lastCheckedAt"));
  if (connector.diagnostics.lastCheckedAt !== null) {
    assert.match(connector.diagnostics.lastCheckedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.ok(Number.isFinite(Date.parse(connector.diagnostics.lastCheckedAt)));
  }
  assert.ok(connector.diagnostics.lastMessage.length <= 500);
}

console.log("app configuration contracts test passed");
