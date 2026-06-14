import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT_PATH = "data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.json";
const OUTPUT_DIR = "data/global_resource_atlas";
const SNAPSHOT_DATE = "2026-06-13";
const OUTPUT_PATH = path.join(OUTPUT_DIR, `global_resource_atlas_${SNAPSHOT_DATE}.json`);

const REGION_BY_GROUP = new Map([
  ["china", { regionKey: "asia-pacific", name: "Asia Pacific" }],
  ["japan", { regionKey: "asia-pacific", name: "Asia Pacific" }],
  ["us", { regionKey: "north-america", name: "North America" }],
  ["europe", { regionKey: "europe", name: "Europe" }]
]);

const FORBIDDEN_CENTER_KEYS = new Set(["surgeryVolume", "patientVolume", "annualPatients", "annualSurgeries"]);

function slugify(value) {
  return String(value ?? "unknown")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function normalizeConfidence(value) {
  if (typeof value === "number") {
    return Math.max(0, Math.min(1, value));
  }

  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "high") {
    return 0.85;
  }
  if (normalized === "medium") {
    return 0.6;
  }
  if (normalized === "low") {
    return 0.35;
  }
  return 0.5;
}

function inferCoverageStatus(verificationStatus, sourceEvidence = []) {
  if (sourceEvidence.length === 0) {
    return "seed";
  }

  const status = String(verificationStatus ?? "").toLowerCase();
  if (status.includes("unverified")) {
    return "partial";
  }
  if (status.includes("verified") || status.includes("cross_checked")) {
    return "verified";
  }
  if (status.includes("mixed") || status.includes("single_source")) {
    return "partial";
  }
  return "seed";
}

function inferDataQuality(center) {
  const status = String(center.verification_status ?? "").toLowerCase();
  if (status.includes("unverified")) {
    return "mixed";
  }
  if (status.includes("mixed")) {
    return "mixed";
  }
  if (status.includes("verified") || status.includes("single_source")) {
    return "public";
  }
  return "unverified";
}

function qualityForChildren(children) {
  if (children.some((child) => child.dataQuality === "mixed")) {
    return "mixed";
  }
  if (children.some((child) => child.dataQuality === "unverified")) {
    return "mixed";
  }
  if (children.every((child) => child.dataQuality === "public")) {
    return "public";
  }
  return "mixed";
}

function statusForChildren(children) {
  if (children.some((child) => child.coverageStatus === "partial")) {
    return "partial";
  }
  if (children.every((child) => child.coverageStatus === "verified")) {
    return "verified";
  }
  if (children.some((child) => child.coverageStatus === "seed")) {
    return "seed";
  }
  return "unknown";
}

function sourceToEvidence(source) {
  return {
    sourceKey: source.source_key,
    title: source.source_title,
    url: source.source_url,
    sourceType: source.source_type,
    accessedAt: source.accessed_at,
    verificationStatus: source.verification_status,
    confidence: normalizeConfidence(source.confidence),
    publishedAt: source.source_published_at,
    evidenceSummary: source.evidence_summary
  };
}

function metricToVolumeMetric(metric) {
  return {
    metricKey: metric.metric_key,
    name: metric.metric_name,
    value: metric.metric_value,
    unit: metric.metric_unit,
    period: metric.metric_period,
    scope: metric.metric_scope,
    definition: metric.metric_definition,
    sourceUrls: [metric.source_url],
    sourceType: metric.source_type,
    verificationStatus: metric.verification_status,
    confidence: normalizeConfidence(metric.confidence)
  };
}

function sortByName(left, right) {
  return left.name.localeCompare(right.name, "en");
}

function addToMapArray(map, key, value) {
  const existing = map.get(key) ?? [];
  existing.push(value);
  map.set(key, existing);
}

function assertNoForbiddenCenterKeys(center) {
  for (const key of FORBIDDEN_CENTER_KEYS) {
    if (Object.hasOwn(center, key)) {
      throw new Error(`forbidden center field emitted: ${key}`);
    }
  }
}

const input = JSON.parse(await readFile(INPUT_PATH, "utf8"));
if (input.snapshot?.snapshot_date !== SNAPSHOT_DATE) {
  throw new Error(`expected snapshot date ${SNAPSHOT_DATE}, received ${input.snapshot?.snapshot_date}`);
}

const sourcesByCenter = new Map();
for (const source of input.sources ?? []) {
  addToMapArray(sourcesByCenter, source.center_key, sourceToEvidence(source));
}

const metricsByCenter = new Map();
for (const metric of input.metrics ?? []) {
  addToMapArray(metricsByCenter, metric.center_key, metricToVolumeMetric(metric));
}

const regions = new Map();

for (const sourceCenter of input.centers ?? []) {
  const region = REGION_BY_GROUP.get(sourceCenter.region_group);
  if (!region) {
    throw new Error(`unsupported region_group ${sourceCenter.region_group} for ${sourceCenter.center_key}`);
  }

  const sourceEvidence = sourcesByCenter.get(sourceCenter.center_key) ?? [];
  const volumeMetrics = metricsByCenter.get(sourceCenter.center_key) ?? [];

  const center = {
    centerKey: sourceCenter.center_key,
    name: sourceCenter.center_name || sourceCenter.hospital_name,
    country: sourceCenter.country,
    city: sourceCenter.city,
    dataQuality: inferDataQuality(sourceCenter),
    coverageStatus: inferCoverageStatus(sourceCenter.verification_status, sourceEvidence),
    publicSignalHeat: sourceCenter.public_signal_heat,
    sourceEvidence,
    volumeMetrics,
    latestIntelligence: [],
    hospitalName: sourceCenter.hospital_name,
    centerName: sourceCenter.center_name,
    departmentName: sourceCenter.department_name,
    provinceState: sourceCenter.province_state,
    centerType: sourceCenter.center_type,
    candidateSignalRank: sourceCenter.candidate_signal_rank,
    candidateTier: sourceCenter.candidate_tier,
    heatNote: sourceCenter.heat_note,
    capabilityTags: sourceCenter.capability_tags ?? [],
    complicationSupportTags: sourceCenter.complication_support_tags ?? [],
    trialSignal: sourceCenter.trial_signal,
    wechatSignal: sourceCenter.wechat_signal,
    scaleSummary: sourceCenter.scale_summary,
    verificationStatus: sourceCenter.verification_status,
    confidence: normalizeConfidence(sourceCenter.confidence),
    notes: sourceCenter.notes
  };

  assertNoForbiddenCenterKeys(center);

  const regionView = regions.get(region.regionKey) ?? {
    regionKey: region.regionKey,
    name: region.name,
    dataQuality: "mixed",
    coverageStatus: "partial",
    countries: new Map()
  };

  const countryKey = slugify(sourceCenter.country);
  const countryView = regionView.countries.get(countryKey) ?? {
    countryKey,
    name: sourceCenter.country,
    regionKey: region.regionKey,
    dataQuality: "mixed",
    coverageStatus: "partial",
    cities: new Map()
  };

  const cityKey = `${countryKey}-${slugify(sourceCenter.city)}`;
  const cityView = countryView.cities.get(cityKey) ?? {
    cityKey,
    name: sourceCenter.city,
    country: sourceCenter.country,
    dataQuality: "mixed",
    coverageStatus: "partial",
    centers: []
  };

  cityView.centers.push(center);
  countryView.cities.set(cityKey, cityView);
  regionView.countries.set(countryKey, countryView);
  regions.set(region.regionKey, regionView);
}

const atlasRegions = [...regions.values()]
  .map((region) => {
    const countries = [...region.countries.values()]
      .map((country) => {
        const cities = [...country.cities.values()]
          .map((city) => {
            city.centers.sort(sortByName);
            return {
              ...city,
              dataQuality: qualityForChildren(city.centers),
              coverageStatus: statusForChildren(city.centers)
            };
          })
          .sort(sortByName);

        return {
          ...country,
          cities,
          dataQuality: qualityForChildren(cities),
          coverageStatus: statusForChildren(cities)
        };
      })
      .sort(sortByName);

    return {
      ...region,
      countries,
      dataQuality: qualityForChildren(countries),
      coverageStatus: statusForChildren(countries)
    };
  })
  .sort((left, right) => left.regionKey.localeCompare(right.regionKey, "en"));

const fixture = {
  snapshotKey: `global_resource_atlas_${SNAPSHOT_DATE}`,
  snapshotDate: SNAPSHOT_DATE,
  regions: atlasRegions
};

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");

const countries = fixture.regions.flatMap((region) => region.countries);
const cities = countries.flatMap((country) => country.cities);
const centers = cities.flatMap((city) => city.centers);

console.log(`wrote ${OUTPUT_PATH}`);
console.log(`regions: ${fixture.regions.length}`);
console.log(`countries: ${countries.length}`);
console.log(`cities: ${cities.length}`);
console.log(`centers: ${centers.length}`);
