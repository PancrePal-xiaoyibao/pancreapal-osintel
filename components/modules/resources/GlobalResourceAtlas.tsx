import atlasFixture from "../../../data/global_resource_atlas/global_resource_atlas_2026-06-13.json";
import type {
  CenterProfileView,
  CountryResourceView,
  GlobalResourceAtlasSnapshot
} from "../../../core/domain/globalResourceTypes";
import { CenterProfilePanel } from "./CenterProfilePanel";
import { CountryResourceBoard } from "./CountryResourceBoard";
import { RegionResourceBoard } from "./RegionResourceBoard";

function loadGlobalResourceAtlasSnapshot(value: unknown): GlobalResourceAtlasSnapshot {
  if (!value || typeof value !== "object") {
    throw new Error("Global resource atlas fixture must be an object.");
  }

  const snapshot = value as Partial<GlobalResourceAtlasSnapshot>;
  if (typeof snapshot.snapshotKey !== "string" || typeof snapshot.snapshotDate !== "string") {
    throw new Error("Global resource atlas fixture is missing snapshot metadata.");
  }

  if (!Array.isArray(snapshot.regions)) {
    throw new Error("Global resource atlas fixture must include regions.");
  }

  for (const region of snapshot.regions) {
    if (!Array.isArray(region.countries)) {
      throw new Error(`Region ${region.regionKey} must include countries.`);
    }

    for (const country of region.countries) {
      if (!Array.isArray(country.cities)) {
        throw new Error(`Country ${country.countryKey} must include cities.`);
      }

      for (const city of country.cities) {
        if (!Array.isArray(city.centers)) {
          throw new Error(`City ${city.cityKey} must include centers.`);
        }

        for (const center of city.centers) {
          if (!Array.isArray(center.sourceEvidence) || !Array.isArray(center.volumeMetrics)) {
            throw new Error(`Center ${center.centerKey} must include evidence and metric arrays.`);
          }

          if (!Array.isArray(center.latestIntelligence)) {
            throw new Error(`Center ${center.centerKey} must include latest intelligence.`);
          }
        }
      }
    }
  }

  return snapshot as GlobalResourceAtlasSnapshot;
}

const atlas = loadGlobalResourceAtlasSnapshot(atlasFixture);

function allCountries(): CountryResourceView[] {
  return atlas.regions.flatMap((region) => region.countries);
}

function centerCount() {
  return atlas.regions.reduce(
    (regionTotal, region) =>
      regionTotal +
      region.countries.reduce(
        (countryTotal, country) =>
          countryTotal + country.cities.reduce((cityTotal, city) => cityTotal + city.centers.length, 0),
        0
      ),
    0
  );
}

function latestIntelCount() {
  return atlas.regions.reduce(
    (regionTotal, region) =>
      regionTotal +
      region.countries.reduce(
        (countryTotal, country) =>
          countryTotal +
          country.cities.reduce(
            (cityTotal, city) =>
              cityTotal +
              city.centers.reduce((centerTotal, center) => centerTotal + center.latestIntelligence.length, 0),
            0
          ),
        0
      ),
    0
  );
}

function firstCenter(): CenterProfileView | null {
  return atlas.regions[0]?.countries[0]?.cities[0]?.centers[0] ?? null;
}

export function GlobalResourceAtlas() {
  const countries = allCountries();

  return (
    <main className="global-resource-atlas">
      <section className="atlas-hero">
        <div>
          <span className="section-kicker">Global Resource Atlas</span>
          <h1>Pancreatic treatment resource command layer</h1>
          <p>
            Static fixture view for region, country, city, center, and intelligence coverage. Cesium is intentionally
            deferred until the shell and read models are stable.
          </p>
        </div>
        <div className="atlas-stats">
          <div>
            <strong>{atlas.regions.length}</strong>
            <span>Regions</span>
          </div>
          <div>
            <strong>{countries.length}</strong>
            <span>Countries</span>
          </div>
          <div>
            <strong>{centerCount()}</strong>
            <span>Centers</span>
          </div>
          <div>
            <strong>{latestIntelCount()}</strong>
            <span>Intel</span>
          </div>
        </div>
      </section>

      <RegionResourceBoard regions={atlas.regions} />

      <section className="atlas-grid">
        <CountryResourceBoard countries={countries} />
        <CenterProfilePanel center={firstCenter()} />
      </section>
    </main>
  );
}
