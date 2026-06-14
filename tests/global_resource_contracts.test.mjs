import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const schema = JSON.parse(await readFile("schemas/global-resource-atlas.schema.json", "utf8"));

assert.equal(schema.title, "Global Resource Atlas");
assert.ok(schema.$defs.CoverageStatus);
assert.ok(schema.$defs.DataQuality);
assert.ok(schema.$defs.SourceEvidenceRef);
assert.ok(schema.$defs.VolumeMetric);
assert.ok(schema.$defs.LatestIntelEvent);
assert.ok(schema.$defs.CenterProfileView);
assert.ok(schema.$defs.CityResourceView);
assert.ok(schema.$defs.CountryResourceView);
assert.ok(schema.$defs.RegionResourceView);

function resolveRef(ref) {
  const prefix = "#/$defs/";
  assert.ok(ref.startsWith(prefix), `unsupported ref ${ref}`);
  const defName = ref.slice(prefix.length);
  assert.ok(schema.$defs[defName], `missing ref target ${defName}`);
  return schema.$defs[defName];
}

function typeMatches(expectedType, value) {
  const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
  return expectedTypes.some((type) => {
    if (type === "array") {
      return Array.isArray(value);
    }
    if (type === "object") {
      return value !== null && typeof value === "object" && !Array.isArray(value);
    }
    return typeof value === type;
  });
}

function validateNode(nodeSchema, value, path = "$") {
  if (nodeSchema.$ref) {
    return validateNode(resolveRef(nodeSchema.$ref), value, path);
  }

  if (nodeSchema.enum) {
    assert.ok(nodeSchema.enum.includes(value), `${path} must be one of ${nodeSchema.enum.join(", ")}`);
  }

  if (nodeSchema.type) {
    assert.ok(typeMatches(nodeSchema.type, value), `${path} type mismatch`);
  }

  if (typeof value === "string" && nodeSchema.minLength) {
    assert.ok(value.length >= nodeSchema.minLength, `${path} is shorter than minLength`);
  }

  if (typeof value === "number") {
    if (typeof nodeSchema.minimum === "number") {
      assert.ok(value >= nodeSchema.minimum, `${path} below minimum`);
    }
    if (typeof nodeSchema.maximum === "number") {
      assert.ok(value <= nodeSchema.maximum, `${path} above maximum`);
    }
  }

  if (Array.isArray(value)) {
    if (typeof nodeSchema.minItems === "number") {
      assert.ok(value.length >= nodeSchema.minItems, `${path} has too few items`);
    }
    if (nodeSchema.items) {
      value.forEach((item, index) => validateNode(nodeSchema.items, item, `${path}[${index}]`));
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = nodeSchema.properties ?? {};
    for (const requiredKey of nodeSchema.required ?? []) {
      assert.ok(Object.hasOwn(value, requiredKey), `${path}.${requiredKey} is required`);
    }
    if (nodeSchema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        assert.ok(Object.hasOwn(properties, key), `${path}.${key} is not allowed`);
      }
    }
    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        validateNode(propertySchema, value[key], `${path}.${key}`);
      }
    }
  }
}

function assertInvalid(sample, expectedMessage) {
  assert.throws(() => validateNode(schema, sample), {
    message: new RegExp(expectedMessage)
  });
}

const sourceEvidence = {
  sourceKey: "src_demo",
  title: "Demo source",
  url: "https://example.org/source",
  sourceType: "hospital_public_page",
  accessedAt: "2026-06-14",
  verificationStatus: "seed",
  confidence: 0.7
};

const volumeMetric = {
  metricKey: "metric_demo",
  name: "Publicly described annual surgery range",
  value: "not disclosed",
  unit: "cases/year",
  period: "2025",
  scope: "center",
  definition: "Public source-backed operational signal, not a quality ranking.",
  sourceUrls: ["https://example.org/source"],
  sourceType: "hospital_public_page",
  verificationStatus: "seed",
  confidence: 0.7
};

const validFixture = {
  snapshotKey: "global_resource_atlas_demo",
  snapshotDate: "2026-06-14",
  regions: [
    {
      regionKey: "asia-pacific",
      name: "Asia Pacific",
      dataQuality: "mixed",
      coverageStatus: "partial",
      countries: [
        {
          countryKey: "china",
          name: "China",
          regionKey: "asia-pacific",
          dataQuality: "mixed",
          coverageStatus: "partial",
          cities: [
            {
              cityKey: "shanghai",
              name: "Shanghai",
              country: "China",
              dataQuality: "mixed",
              coverageStatus: "partial",
              centers: [
                {
                  centerKey: "cn_shanghai_demo",
                  name: "Shanghai Demo Pancreatic Center",
                  country: "China",
                  city: "Shanghai",
                  dataQuality: "mixed",
                  coverageStatus: "partial",
                  sourceEvidence: [sourceEvidence],
                  volumeMetrics: [volumeMetric],
                  latestIntelligence: [
                    {
                      eventKey: "evt_demo",
                      title: "Demo linked intelligence",
                      publishedAt: "2026-06-14",
                      scope: "center",
                      reviewStatus: "seed",
                      sourceEvidence: [sourceEvidence]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

validateNode(schema, validFixture);

assertInvalid(
  {
    ...validFixture,
    regions: [
      {
        ...validFixture.regions[0],
        countries: "not-an-array"
      }
    ]
  },
  "\\$\\.regions\\[0\\]\\.countries type mismatch"
);

assertInvalid(
  {
    ...validFixture,
    regions: [
      {
        ...validFixture.regions[0],
        countries: [
          {
            ...validFixture.regions[0].countries[0],
            cities: [
              {
                ...validFixture.regions[0].countries[0].cities[0],
                centers: [
                  {
                    ...validFixture.regions[0].countries[0].cities[0].centers[0],
                    volumeMetrics: [
                      {
                        ...volumeMetric,
                        surgeryVolume: 120
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "\\$\\.regions\\[0\\]\\.countries\\[0\\]\\.cities\\[0\\]\\.centers\\[0\\]\\.volumeMetrics\\[0\\]\\.surgeryVolume is not allowed"
);

console.log("global resource contract schema test passed");
