import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import seeder from "../realtime/seeders/pancreatic-centers/seeder.mjs";
import { DataBus } from "../realtime/runtime/DataBus.mjs";
import { GlobeStore } from "../realtime/runtime/globe-store.mjs";
import { createGlobeAnimationLoop } from "../realtime/runtime/AnimationLoop.mjs";
import { projectEntityToPoint } from "../realtime/runtime/primitive-projection.mjs";
import { CAMERA_PRESETS, createCameraPresetEvent } from "../realtime/runtime/camera-presets.mjs";

const entities = await seeder.fetch();

assert.equal(seeder.name, "pancreatic-centers");
assert.ok(entities.some((entity) => entity.entityType === "region"));
assert.ok(entities.some((entity) => entity.entityType === "country"));
assert.ok(entities.some((entity) => entity.entityType === "city"));
assert.ok(entities.some((entity) => entity.entityType === "center"));
assert.ok(entities.length > 48);
assert.ok(entities.every((entity) => entity.pluginId === "pancreatic-centers"));
assert.ok(
  entities
    .filter((entity) => entity.entityType !== "center")
    .every((entity) => entity.properties.centersCount > 0),
  "aggregate realtime entities must have renderable child centers"
);
assert.ok(
  entities.some(
    (entity) =>
      entity.entityType === "center" &&
      entity.properties.centerKey === "cn_shanghai_shanghai_first_pancreatic_surgery" &&
      entity.properties.regionKey === "asia-pacific"
  )
);

const bus = new DataBus();
const store = new GlobeStore();
store.bind(bus);
bus.emit("dataUpdated", { pluginId: seeder.name, entities });

assert.equal(store.getPluginEntities(seeder.name).length, entities.length);

const firstPoint = projectEntityToPoint(entities[0]);
assert.equal(firstPoint.id, "center:cn_shanghai_fudan_cancer_pancreatic_surgery");
assert.equal(firstPoint.style.heat, 98);
assert.equal(firstPoint.style.outlineWidth, 2);

const shanghaiPreset = createCameraPresetEvent("shanghai");
assert.equal(CAMERA_PRESETS.global.altitude, 20000000);
assert.equal(shanghaiPreset.preset.lon, 121.47);

let frameData = null;
const loop = createGlobeAnimationLoop({
  store,
  cameraProvider: () => ({
    latitude: shanghaiPreset.preset.lat,
    longitude: shanghaiPreset.preset.lon,
    altitude: shanghaiPreset.preset.altitude
  }),
  renderer: {
    renderFrame: (data) => {
      frameData = data;
    }
  },
  requestFrame: () => 0,
  cancelFrame: () => {}
});
loop.tick();

assert.ok(frameData.visibleEntities.length > 0);
assert.equal(frameData.projectedPoints.length, frameData.visibleEntities.length);

const runner = spawnSync(
  process.execPath,
  ["scripts/run_realtime_seeder.mjs", "--plugin", "pancreatic-centers", "--once"],
  { encoding: "utf8" }
);
assert.equal(runner.status, 0, runner.stderr);
assert.equal(runner.stdout.trim().split("\n").length, 1);
const streamMessage = JSON.parse(runner.stdout);
assert.equal(streamMessage.type, "data");
assert.equal(streamMessage.pluginId, "pancreatic-centers");
assert.equal(streamMessage.payload.length, entities.length);

console.log("realtime runtime tests passed");
