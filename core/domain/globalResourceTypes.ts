export type CoverageStatus = "seed" | "partial" | "verified" | "stale" | "unknown";

export type DataQuality = "public" | "estimated" | "mixed" | "unverified";

export type SourceEvidenceRef = {
  sourceKey: string;
  title: string;
  url: string;
  sourceType: string;
  accessedAt: string;
  verificationStatus: string;
  confidence: number;
  publishedAt?: string | null;
  evidenceSummary?: string;
};

export type VolumeMetric = {
  metricKey: string;
  name: string;
  value: number;
  unit: string;
  period: string;
  scope: string;
  definition: string;
  sourceUrls: string[];
  sourceType: string;
  verificationStatus: string;
  confidence: number;
};

export type CenterLatestIntelView = {
  eventKey: string;
  title: string;
  publishedAt: string;
  scope: string;
  reviewStatus: string;
  sourceEvidence: SourceEvidenceRef[];
  summary?: string;
};

export type CenterProfileView = {
  centerKey: string;
  name: string;
  country: string;
  city: string;
  dataQuality: DataQuality;
  coverageStatus: CoverageStatus;
  sourceEvidence: SourceEvidenceRef[];
  volumeMetrics: VolumeMetric[];
  latestIntelligence: CenterLatestIntelView[];
  publicSignalHeat?: number;
  hospitalName?: string;
  centerName?: string;
  departmentName?: string;
  provinceState?: string;
  centerType?: string;
  candidateSignalRank?: number;
  candidateTier?: string;
  heatNote?: string;
  capabilityTags?: string[];
  complicationSupportTags?: string[];
  trialSignal?: string;
  scaleSummary?: string;
  verificationStatus?: string;
  confidence?: number;
  notes?: string;
};

export type CityResourceView = {
  cityKey: string;
  name: string;
  country: string;
  dataQuality: DataQuality;
  coverageStatus: CoverageStatus;
  centers: CenterProfileView[];
};

export type CountryResourceView = {
  countryKey: string;
  name: string;
  regionKey: string;
  dataQuality: DataQuality;
  coverageStatus: CoverageStatus;
  cities: CityResourceView[];
};

export type RegionResourceView = {
  regionKey: string;
  name: string;
  dataQuality: DataQuality;
  coverageStatus: CoverageStatus;
  countries: CountryResourceView[];
};

export type GlobalResourceAtlasSnapshot = {
  snapshotKey: string;
  snapshotDate: string;
  regions: RegionResourceView[];
};
