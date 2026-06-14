import type { CountryResourceView } from "../../../core/domain/globalResourceTypes";

type CountryResourceBoardProps = {
  countries: CountryResourceView[];
};

function countCenters(country: CountryResourceView) {
  return country.cities.reduce((total, city) => total + city.centers.length, 0);
}

function countIntel(country: CountryResourceView) {
  return country.cities.reduce(
    (total, city) =>
      total + city.centers.reduce((centerTotal, center) => centerTotal + center.latestIntelligence.length, 0),
    0
  );
}

export function CountryResourceBoard({ countries }: CountryResourceBoardProps) {
  return (
    <section className="country-board">
      <div className="section-heading">
        <span className="section-kicker">Country Board</span>
        <h2>Coverage rows</h2>
      </div>
      <div className="country-table">
        {countries.map((country) => (
          <div className="country-row" key={country.countryKey}>
            <div>
              <strong>{country.name}</strong>
              <span>{country.regionKey}</span>
            </div>
            <span>{country.cities.length} cities</span>
            <span>{countCenters(country)} centers</span>
            <span>{country.coverageStatus}</span>
            <span>{countIntel(country)} intel</span>
          </div>
        ))}
      </div>
    </section>
  );
}
