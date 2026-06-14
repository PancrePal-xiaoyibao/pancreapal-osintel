import type { CenterProfileView } from "../../../core/domain/globalResourceTypes";
import { CenterLatestIntelTimeline } from "./CenterLatestIntelTimeline";

type CenterProfilePanelProps = {
  center: CenterProfileView | null;
};

export function CenterProfilePanel({ center }: CenterProfilePanelProps) {
  if (!center) {
    return (
      <aside className="center-profile-panel empty-panel">
        <div className="section-kicker">Center Profile</div>
        <h2>No center selected</h2>
        <p className="profile-subtitle">The atlas fixture did not return a center for the current selection.</p>
      </aside>
    );
  }

  const tags = center.capabilityTags?.slice(0, 6) ?? [];

  return (
    <aside className="center-profile-panel">
      <div className="section-kicker">First Center Sample</div>
      <h2>{center.hospitalName ?? center.name}</h2>
      <p className="profile-subtitle">
        {center.centerName ?? center.name} / {center.city}, {center.country}
      </p>

      <div className="profile-grid">
        <div>
          <span>Coverage</span>
          <strong>{center.coverageStatus}</strong>
        </div>
        <div>
          <span>Data quality</span>
          <strong>{center.dataQuality}</strong>
        </div>
        <div>
          <span>Evidence refs</span>
          <strong>{center.sourceEvidence.length}</strong>
        </div>
        <div>
          <span>Metric refs</span>
          <strong>{center.volumeMetrics.length}</strong>
        </div>
      </div>

      {center.heatNote ? <p className="profile-note">{center.heatNote}</p> : null}

      <div className="tag-cloud">
        {tags.map((tag) => (
          <span key={tag}>{tag.replaceAll("_", " ")}</span>
        ))}
      </div>

      <CenterLatestIntelTimeline items={center.latestIntelligence} />
    </aside>
  );
}
