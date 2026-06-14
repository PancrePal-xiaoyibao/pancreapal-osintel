export const CAMERA_PRESETS = {
  global: { lat: 20, lon: 0, altitude: 20000000, heading: 0, pitch: -90 },
  china: { lat: 32, lon: 105, altitude: 6000000, heading: 0, pitch: -80 },
  shanghai: { lat: 31.23, lon: 121.47, altitude: 900000, heading: 0, pitch: -70 },
  beijing: { lat: 39.9, lon: 116.4, altitude: 900000, heading: 0, pitch: -70 },
  chengdu: { lat: 30.57, lon: 104.07, altitude: 900000, heading: 0, pitch: -70 },
  wuhan: { lat: 30.59, lon: 114.31, altitude: 900000, heading: 0, pitch: -70 },
  us: { lat: 38, lon: -97, altitude: 6000000, heading: 0, pitch: -80 },
  japan: { lat: 36, lon: 138, altitude: 3000000, heading: 0, pitch: -78 },
  europe: { lat: 50, lon: 15, altitude: 6000000, heading: 0, pitch: -78 }
};

export function getCameraPreset(presetId) {
  return CAMERA_PRESETS[presetId] || null;
}

export function createCameraPresetEvent(presetId) {
  const preset = getCameraPreset(presetId);
  if (!preset) {
    throw new Error(`Unknown camera preset "${presetId}"`);
  }
  return { presetId, preset };
}
