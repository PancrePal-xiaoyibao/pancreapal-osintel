import type { CenterLatestIntelView } from "../../../core/domain/globalResourceTypes";

type CenterLatestIntelTimelineProps = {
  items: CenterLatestIntelView[];
};

export function CenterLatestIntelTimeline({ items }: CenterLatestIntelTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="intel-empty">
        <span>No linked intelligence in this fixture.</span>
        <small>Center profiles still reserve this rail for source-backed updates.</small>
      </div>
    );
  }

  return (
    <ol className="intel-timeline">
      {items.map((item) => (
        <li key={item.eventKey}>
          <time>{item.publishedAt}</time>
          <strong>{item.title}</strong>
          <span>{item.scope}</span>
        </li>
      ))}
    </ol>
  );
}
