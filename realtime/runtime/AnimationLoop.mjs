import { projectEntitiesToPoints } from "./primitive-projection.mjs";

const EARTH_RADIUS_M = 6371000;
const EARTH_RADIUS_SQUARED = EARTH_RADIUS_M * EARTH_RADIUS_M;

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function getEntitySpeed(entity) {
  const direct = entity.speed;
  const nested = entity.properties?.speed;
  const speed = direct ?? nested ?? 0;
  return Number.isFinite(speed) ? speed : 0;
}

export function toCartesian({ latitude, longitude, altitude = 0 }) {
  const lat = degreesToRadians(latitude);
  const lon = degreesToRadians(longitude);
  const radius = EARTH_RADIUS_M + altitude;
  const cosLat = Math.cos(lat);

  return {
    x: radius * cosLat * Math.cos(lon),
    y: radius * cosLat * Math.sin(lon),
    z: radius * Math.sin(lat)
  };
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cameraToCartesian(camera) {
  if (camera?.x !== undefined && camera?.y !== undefined && camera?.z !== undefined) {
    return camera;
  }
  return toCartesian({
    latitude: camera.latitude,
    longitude: camera.longitude,
    altitude: camera.altitude || camera.alt || 0
  });
}

export function isVisibleFromCamera(entity, camera) {
  const cameraCartesian = cameraToCartesian(camera);
  const entityCartesian = toCartesian({
    latitude: entity.latitude,
    longitude: entity.longitude,
    altitude: entity.altitude || 0
  });

  return dot(cameraCartesian, entityCartesian) > EARTH_RADIUS_SQUARED;
}

export function bucketEntities(entities) {
  const dynamic = [];
  const staticBatch = [];
  for (const entity of entities) {
    if (getEntitySpeed(entity) > 0) {
      dynamic.push(entity);
    } else {
      staticBatch.push(entity);
    }
  }
  return { dynamic, staticBatch };
}

function defaultRequestFrame(callback) {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(callback);
  }
  return setTimeout(() => callback(Date.now()), 16);
}

function defaultCancelFrame(frameId) {
  if (typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(frameId);
  } else {
    clearTimeout(frameId);
  }
}

export function createGlobeAnimationLoop({
  store,
  renderer,
  cameraProvider,
  staticCullIntervalFrames = 30,
  requestFrame = defaultRequestFrame,
  cancelFrame = defaultCancelFrame
}) {
  if (!store || typeof store.getAllEntities !== "function") {
    throw new TypeError("[AnimationLoop] store.getAllEntities() is required");
  }
  if (!renderer || typeof renderer.renderFrame !== "function") {
    throw new TypeError("[AnimationLoop] renderer.renderFrame() is required");
  }
  if (typeof cameraProvider !== "function") {
    throw new TypeError("[AnimationLoop] cameraProvider() is required");
  }

  let running = false;
  let frame = 0;
  let frameId = null;
  let cachedStaticVisible = [];

  function tick() {
    const camera = cameraProvider();
    const entities = store.getAllEntities();
    const { dynamic, staticBatch } = bucketEntities(entities);
    const shouldCullStatic = frame % staticCullIntervalFrames === 0;

    const visibleDynamic = dynamic.filter((entity) => isVisibleFromCamera(entity, camera));
    if (shouldCullStatic) {
      cachedStaticVisible = staticBatch.filter((entity) => isVisibleFromCamera(entity, camera));
    }

    const visibleEntities = [...visibleDynamic, ...cachedStaticVisible];
    renderer.renderFrame({
      frame,
      camera,
      dynamicEntities: visibleDynamic,
      staticEntities: cachedStaticVisible,
      visibleEntities,
      projectedPoints: projectEntitiesToPoints(visibleEntities)
    });

    frame += 1;
    if (running) {
      frameId = requestFrame(tick);
    }
  }

  return {
    start() {
      if (running) return;
      running = true;
      frameId = requestFrame(tick);
    },
    stop() {
      running = false;
      if (frameId !== null) {
        cancelFrame(frameId);
        frameId = null;
      }
    },
    tick,
    getFrame() {
      return frame;
    }
  };
}
