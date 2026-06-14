import type { RegionResourceView } from "../../../core/domain/globalResourceTypes";

type RegionResourceBoardProps = {
  regions: RegionResourceView[];
};

function countRegionCenters(region: RegionResourceView) {
  return region.countries.reduce(
    (countryTotal, country) =>
      countryTotal + country.cities.reduce((cityTotal, city) => cityTotal + city.centers.length, 0),
    0
  );
}

function countRegionIntel(region: RegionResourceView) {
  return region.countries.reduce(
    (countryTotal, country) =>
      countryTotal +
      country.cities.reduce(
        (cityTotal, city) =>
          cityTotal + city.centers.reduce((centerTotal, center) => centerTotal + center.latestIntelligence.length, 0),
        0
      ),
    0
  );
}

export function RegionResourceBoard({ regions }: RegionResourceBoardProps) {
  return (
    <section className="region-board">
      {regions.map((region) => (
        <article className="region-card" key={region.regionKey}>
          <div className="region-card-header">
            <span>{region.coverageStatus}</span>
            <strong>{region.dataQuality}</strong>
          </div>
          <h3>{region.name}</h3>
          <div className="region-card-metrics">
            <div>
              <b>{region.countries.length}</b>
              <span>Countries</span>
            </div>
            <div>
              <b>{countRegionCenters(region)}</b>
              <span>Centers</span>
            </div>
            <div>
              <b>{countRegionIntel(region)}</b>
              <span>Intel</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
