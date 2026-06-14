import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../..");
const SNAPSHOT_PATH = resolve(
  PROJECT_ROOT,
  "data/global_resource_atlas/global_resource_atlas_2026-06-13.json"
);

const PLUGIN_ID = "pancreatic-centers";
const SNAPSHOT_SOURCE_URL = "https://dngmthqacazkqhtykyvy.supabase.co";

const CITY_COORDINATES = {
  Beijing: [39.9042, 116.4074],
  Chengdu: [30.5728, 104.0668],
  Chongqing: [29.563, 106.5516],
  Fuzhou: [26.0745, 119.2965],
  Guangzhou: [23.1291, 113.2644],
  Hangzhou: [30.2741, 120.1551],
  Harbin: [45.8038, 126.5349],
  "Hong Kong": [22.3193, 114.1694],
  Nagaizumi: [35.1379, 138.8971],
  Nanjing: [32.0603, 118.7969],
  Okayama: [34.6551, 133.9195],
  Shanghai: [31.2304, 121.4737],
  Shijiazhuang: [38.0428, 114.5149],
  Stockholm: [59.3293, 18.0686],
  Tianjin: [39.3434, 117.3616],
  Tokyo: [35.6762, 139.6503],
  Wuhan: [30.5928, 114.3055],
  "Xi'an": [34.3416, 108.9398],
  Baltimore: [39.2904, -76.6122],
  Boston: [42.3601, -71.0589],
  Heidelberg: [49.3988, 8.6724],
  Houston: [29.7604, -95.3698],
  Jacksonville: [30.3322, -81.6557],
  London: [51.5072, -0.1276],
  Milan: [45.4642, 9.19],
  "New York": [40.7128, -74.006],
  "St. Louis": [38.627, -90.1994],
  Verona: [45.4384, 10.9916]
};

const CENTER_COORDINATES = {
  cn_shanghai_fudan_cancer_pancreatic_surgery: [31.196, 121.448],
  cn_shanghai_ruijin_pancreas_center: [31.207, 121.474],
  cn_shanghai_changhai_hbp: [31.311, 121.525],
  cn_nanjing_jsph_pancreas_center: [32.058, 118.773],
  cn_wuhan_union_pancreatic_surgery: [30.594, 114.271],
  cn_beijing_cicams_pancreatic_gastric_surgery: [39.914, 116.451],
  cn_shanghai_huashan_pancreatic_surgery: [31.216, 121.454],
  cn_chengdu_west_china_pancreatic_surgery: [30.641, 104.064],
  cn_hangzhou_zju1_hbp: [30.264, 120.172],
  cn_guangzhou_gdgh_pancreas_center: [23.129, 113.323],
  cn_shanghai_zhongshan_pancreatic_surgery: [31.198, 121.454],
  cn_shanghai_shanghai_first_pancreatic_surgery: [31.259, 121.488],
  us_mayo_florida_pancreatic_surgery: [30.264, -81.441],
  us_msk_pancreatic_surgery: [40.764, -73.956],
  eu_heidelberg_epc: [49.418, 8.667],
  jp_shizuoka_cancer_hbp: [35.139, 138.897]
};

function average(values) {
  if (values.length === 0) return 50;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundHeat(value) {
  return Math.round(value * 10) / 10;
}

function centroidFromEntities(entities) {
  if (entities.length === 0) {
    return null;
  }
  return [
    average(entities.map((entity) => entity.latitude)),
    average(entities.map((entity) => entity.longitude))
  ];
}

function fallbackCoordinates(center) {
  const city = center.city || "";
  const pair = CENTER_COORDINATES[center.centerKey] || CITY_COORDINATES[city];
  if (!pair) return null;
  return pair;
}

function dataQualityFromStatus(status = "") {
  if (status.includes("verified_official")) return "public";
  if (status.includes("mixed")) return "mixed";
  if (status.includes("unverified")) return "unverified";
  return "mixed";
}

function sourceFor(center) {
  const source = center.sourceEvidence?.[0];
  return {
    type: source?.sourceType || "global_resource_atlas_snapshot",
    url: source?.url || SNAPSHOT_SOURCE_URL,
    accessedAt: source?.accessedAt || "2026-06-13",
    verificationStatus: source?.verificationStatus || center.verificationStatus
  };
}

function toCenterEntity(center, keys, snapshotDate) {
  const coordinates = fallbackCoordinates(center);
  if (!coordinates) return null;
  const [latitude, longitude] = coordinates;

  return {
    id: `center:${center.centerKey}`,
    pluginId: PLUGIN_ID,
    entityType: "center",
    latitude,
    longitude,
    altitude: center.candidateSignalRank ? 12000 : 8000,
    timestamp: `${snapshotDate}T00:00:00.000Z`,
    label: center.hospitalName,
    layer: "treatment-centers",
    heat: center.publicSignalHeat ?? 50,
    dataQuality: center.dataQuality || dataQualityFromStatus(center.verificationStatus),
    source: sourceFor(center),
    properties: {
      regionKey: keys.regionKey,
      countryKey: keys.countryKey,
      cityKey: keys.cityKey,
      country: center.country,
      provinceState: center.provinceState,
      city: center.city,
      centerKey: center.centerKey,
      hospitalName: center.hospitalName,
      centerName: center.centerName,
      candidateSignalRank: center.candidateSignalRank,
      capabilityTags: center.capabilityTags || [],
      complicationSupportTags: center.complicationSupportTags || [],
      scaleSummary: center.scaleSummary || ""
    }
  };
}

function aggregateSource(snapshotDate) {
  return {
    type: "global_resource_atlas_snapshot",
    url: SNAPSHOT_SOURCE_URL,
    accessedAt: snapshotDate,
    verificationStatus: "source_backed_projection"
  };
}

function toRegionEntity(region, childEntities, snapshotDate) {
  const centroid = centroidFromEntities(childEntities);
  if (!centroid) return null;
  const [latitude, longitude] = centroid;
  return {
    id: `region:${region.regionKey}`,
    pluginId: PLUGIN_ID,
    entityType: "region",
    latitude,
    longitude,
    altitude: 50000,
    timestamp: `${snapshotDate}T00:00:00.000Z`,
    label: region.name,
    layer: "treatment-centers",
    heat: roundHeat(average(childEntities.map((entity) => entity.heat ?? 50))),
    dataQuality: region.dataQuality,
    source: aggregateSource(snapshotDate),
    properties: {
      regionKey: region.regionKey,
      publicSignalAggregation: "average_child_center_public_signal_heat",
      countriesCount: region.countries.length,
      centersCount: childEntities.length,
      coverageStatus: region.coverageStatus
    }
  };
}

function toCountryEntity(country, childEntities, snapshotDate) {
  const centroid = centroidFromEntities(childEntities);
  if (!centroid) return null;
  const [latitude, longitude] = centroid;
  return {
    id: `country:${country.countryKey}`,
    pluginId: PLUGIN_ID,
    entityType: "country",
    latitude,
    longitude,
    altitude: 32000,
    timestamp: `${snapshotDate}T00:00:00.000Z`,
    label: country.name,
    layer: "treatment-centers",
    heat: roundHeat(average(childEntities.map((entity) => entity.heat ?? 50))),
    dataQuality: country.dataQuality,
    source: aggregateSource(snapshotDate),
    properties: {
      regionKey: country.regionKey,
      countryKey: country.countryKey,
      country: country.name,
      publicSignalAggregation: "average_child_center_public_signal_heat",
      citiesCount: country.cities.length,
      centersCount: childEntities.length,
      coverageStatus: country.coverageStatus
    }
  };
}

function toCityEntity(city, keys, childEntities, snapshotDate) {
  const centroid = centroidFromEntities(childEntities);
  if (!centroid) return null;
  const [latitude, longitude] = centroid;
  return {
    id: `city:${city.cityKey}`,
    pluginId: PLUGIN_ID,
    entityType: "city",
    latitude,
    longitude,
    altitude: 20000,
    timestamp: `${snapshotDate}T00:00:00.000Z`,
    label: `${city.name}, ${city.country}`,
    layer: "treatment-centers",
    heat: roundHeat(average(childEntities.map((entity) => entity.heat ?? 50))),
    dataQuality: city.dataQuality,
    source: aggregateSource(snapshotDate),
    properties: {
      regionKey: keys.regionKey,
      countryKey: keys.countryKey,
      cityKey: city.cityKey,
      country: city.country,
      city: city.name,
      publicSignalAggregation: "average_child_center_public_signal_heat",
      centersCount: childEntities.length,
      coverageStatus: city.coverageStatus
    }
  };
}

function compareCenterEntities(left, right) {
  const leftRank = left.properties.candidateSignalRank ?? Number.POSITIVE_INFINITY;
  const rightRank = right.properties.candidateSignalRank ?? Number.POSITIVE_INFINITY;
  if (leftRank !== rightRank) return leftRank - rightRank;
  return left.label.localeCompare(right.label, "en");
}

async function loadEntities() {
  const raw = await readFile(SNAPSHOT_PATH, "utf8");
  const atlas = JSON.parse(raw);
  const centerEntities = [];
  const cityEntities = [];
  const countryEntities = [];
  const regionEntities = [];

  for (const region of atlas.regions) {
    const regionCenterEntities = [];

    for (const country of region.countries) {
      const countryCenterEntities = [];

      for (const city of country.cities) {
        const cityCenterEntities = city.centers
          .map((center) =>
            toCenterEntity(
              center,
              { regionKey: region.regionKey, countryKey: country.countryKey, cityKey: city.cityKey },
              atlas.snapshotDate
            )
          )
          .filter(Boolean);

        centerEntities.push(...cityCenterEntities);
        countryCenterEntities.push(...cityCenterEntities);
        regionCenterEntities.push(...cityCenterEntities);
        const cityEntity = toCityEntity(
          city,
          { regionKey: region.regionKey, countryKey: country.countryKey },
          cityCenterEntities,
          atlas.snapshotDate
        );
        if (cityEntity) cityEntities.push(cityEntity);
      }

      const countryEntity = toCountryEntity(country, countryCenterEntities, atlas.snapshotDate);
      if (countryEntity) countryEntities.push(countryEntity);
    }

    const regionEntity = toRegionEntity(region, regionCenterEntities, atlas.snapshotDate);
    if (regionEntity) regionEntities.push(regionEntity);
  }

  centerEntities.sort(compareCenterEntities);
  return [...centerEntities, ...regionEntities, ...countryEntities, ...cityEntities];
}

export default {
  name: PLUGIN_ID,
  interval: 300000,
  fetch: async () => {
    const entities = await loadEntities();
    console.error(`[${PLUGIN_ID}] emitting ${entities.length} global atlas realtime entities`);
    return entities;
  }
};
