import { ATTENDANCE_DATA } from "../../api/mockData";

// readOnly = true  → mentor view inside MenteeDetail
// readOnly = false → mentee's own standalone page
export default function Attendance({ readOnly = false }) {
  const totalPresent = ATTENDANCE_DATA.reduce((a, m) => a + m.present, 0);
  const totalDays    = ATTENDANCE_DATA.reduce((a, m) => a + m.total,   0);
  const overall      = Math.round((totalPresent / totalDays) * 100);

  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Attendance</div>
          <div className="page-sub">Academic Year 2024–25</div>
        </>
      )}

      {/* Summary */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: overall < 75 ? "var(--red-mid)" : "var(--red)" }}>
            {overall}%
          </div>
          <div className="stat-label">Overall Attendance</div>
          <div style={{ fontSize: 12, color: overall < 75 ? "var(--red-mid)" : "#15803d", marginTop: 4 }}>
            {overall < 75 ? "⚠️ Below 75% threshold" : "✅ Eligible"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPresent}</div>
          <div className="stat-label">Days Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDays - totalPresent}</div>
          <div className="stat-label">Days Absent</div>
        </div>
      </div>

      {/* Bar Chart + Monthly Grid */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">Monthly Breakdown</div>
        </div>
        <div className="wcard-body">
          {/* Bar chart */}
          <div className="att-bars">
            {ATTENDANCE_DATA.map((m) => {
              const pct = Math.round((m.present / m.total) * 100);
              return (
                <div className="att-bar-col" key={m.month}>
                  <div className="att-bar-val">{pct}%</div>
                  <div
                    className="att-bar"
                    style={{
                      height: `${pct}%`,
                      background: pct < 75 ? "var(--red-mid)" : "var(--red)",
                    }}
                  />
                  <div className="att-bar-lbl">{m.month}</div>
                </div>
              );
            })}
          </div>

          {/* Monthly cards grid */}
          <div className="att-month-grid">
            {ATTENDANCE_DATA.map((m) => {
              const pct = Math.round((m.present / m.total) * 100);
              return (
                <div className="att-month-card" key={m.month}>
                  <div className="att-month-name">{m.month}</div>
                  <div
                    className="att-month-pct"
                    style={{ color: pct < 75 ? "var(--red-mid)" : "var(--red)" }}
                  >
                    {pct}%
                  </div>
                  <div className="att-month-det">{m.present}/{m.total} days</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
