import { GlobalResourceAtlas } from "../modules/resources/GlobalResourceAtlas";

const navItems = ["Global Atlas", "Risk Radar", "AI-MDT", "Forecast Audit", "Reports"];

export function WarRoomShell() {
  return (
    <div className="war-room-shell">
      <header className="war-room-header">
        <div>
          <span className="brand-mark">PPOSINTEL</span>
          <h1>Pancreatic Oncology War Room</h1>
        </div>
        <div className="header-status">
          <span>Fixture sync</span>
          <strong>2026-06-13</strong>
        </div>
      </header>

      <nav className="top-nav" aria-label="War Room modules">
        {navItems.map((item) => (
          <button className={item === "Global Atlas" ? "active" : undefined} key={item} type="button">
            {item}
          </button>
        ))}
      </nav>

      <section className="index-strip" aria-label="Index strip placeholder">
        <div>
          <span>Coverage pulse</span>
          <strong>Region &gt; Country &gt; City &gt; Center</strong>
        </div>
        <div>
          <span>Source posture</span>
          <strong>Evidence-gated</strong>
        </div>
        <div>
          <span>Realtime stream</span>
          <strong>Projection ready</strong>
        </div>
      </section>

      <GlobalResourceAtlas />

      <footer className="activity-footer">
        <span>Last activity: static atlas fixture loaded.</span>
        <span>Next sync target: Supabase read model + realtime projection.</span>
      </footer>
    </div>
  );
}
