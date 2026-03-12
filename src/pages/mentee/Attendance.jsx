import { useState, useEffect } from "react";
import { getMenteeAttendance } from "../../api/api";

export default function Attendance({ readOnly = false, data = null }) {
  const [attendanceData, setAttendanceData] = useState(data || []);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) { setAttendanceData(data); return; }
    if (!readOnly) {
      getMenteeAttendance()
        .then(setAttendanceData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [data, readOnly]);

  if (loading) return <div className="page-sub">Loading attendance...</div>;
  if (!attendanceData.length) return <div className="page-sub">No attendance data found.</div>;

  const totalPresent = attendanceData.reduce((a, m) => a + (m.days_present ?? m.present ?? 0), 0);
  const totalDays    = attendanceData.reduce((a, m) => a + (m.days_present ?? m.present ?? 0) + (m.days_absent ?? (m.total - m.present) ?? 0), 0);
  const overall      = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Attendance</div>
          <div className="page-sub">Academic Year 2024–25</div>
        </>
      )}

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

      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">Monthly Breakdown</div>
        </div>
        <div className="wcard-body">
          <div className="att-bars">
            {attendanceData.map((m) => {
              const present = m.days_present ?? m.present ?? 0;
              const total   = present + (m.days_absent ?? (m.total - m.present) ?? 0);
              const pct     = total > 0 ? Math.round((present / total) * 100) : 0;
              return (
                <div className="att-bar-col" key={m.month}>
                  <div className="att-bar-val">{pct}%</div>
                  <div className="att-bar" style={{ height: `${pct}%`, background: pct < 75 ? "var(--red-mid)" : "var(--red)" }} />
                  <div className="att-bar-lbl">{m.month}</div>
                </div>
              );
            })}
          </div>
          <div className="att-month-grid">
            {attendanceData.map((m) => {
              const present = m.days_present ?? m.present ?? 0;
              const total   = present + (m.days_absent ?? (m.total - m.present) ?? 0);
              const pct     = total > 0 ? Math.round((present / total) * 100) : 0;
              return (
                <div className="att-month-card" key={m.month}>
                  <div className="att-month-name">{m.month}</div>
                  <div className="att-month-pct" style={{ color: pct < 75 ? "var(--red-mid)" : "var(--red)" }}>{pct}%</div>
                  <div className="att-month-det">{present}/{total} days</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
