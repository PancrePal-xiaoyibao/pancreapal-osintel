const HEAT_COLORS = [
  { stop: 0, color: [43, 111, 255] },
  { stop: 35, color: [28, 203, 194] },
  { stop: 70, color: [245, 196, 83] },
  { stop: 100, color: [234, 82, 82] }
];

const QUALITY_ALPHA = {
  public: 1,
  mixed: 0.82,
  estimated: 0.68,
  unverified: 0.5
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function interpolateColor(a, b, ratio) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * ratio),
    Math.round(a[1] + (b[1] - a[1]) * ratio),
    Math.round(a[2] + (b[2] - a[2]) * ratio)
  ];
}

function rgbToCss(color, alpha) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

export function heatToPointStyle(heat = 50, dataQuality = "mixed") {
  const normalizedHeat = clamp(Number.isFinite(heat) ? heat : 50, 0, 100);
  const upperIndex = HEAT_COLORS.findIndex((item) => item.stop >= normalizedHeat);
  const upper = HEAT_COLORS[upperIndex === -1 ? HEAT_COLORS.length - 1 : upperIndex];
  const lower = HEAT_COLORS[Math.max(0, (upperIndex === -1 ? HEAT_COLORS.length - 1 : upperIndex) - 1)];
  const span = upper.stop - lower.stop || 1;
  const ratio = clamp((normalizedHeat - lower.stop) / span, 0, 1);
  const rgb = interpolateColor(lower.color, upper.color, ratio);
  const alpha = QUALITY_ALPHA[dataQuality] || QUALITY_ALPHA.mixed;

  return {
    pixelSize: Math.round(6 + normalizedHeat / 10),
    outlineWidth: normalizedHeat >= 80 ? 2 : 1,
    color: rgbToCss(rgb, alpha),
    outlineColor: rgbToCss([255, 255, 255], alpha >= 0.8 ? 0.9 : 0.55),
    heat: normalizedHeat,
    dataQuality
  };
}

export function projectEntityToPoint(entity) {
  return {
    id: entity.id,
    pluginId: entity.pluginId,
    entityType: entity.entityType,
    layer: entity.layer || "treatment-centers",
    position: {
      latitude: entity.latitude,
      longitude: entity.longitude,
      altitude: entity.altitude || 0
    },
    label: entity.label,
    style: heatToPointStyle(entity.heat, entity.dataQuality),
    source: entity.source,
    properties: entity.properties || {}
  };
}

export function projectEntitiesToPoints(entities) {
  return entities.map(projectEntityToPoint);
}
