import { useState, useEffect } from "react";
import { getMenteeAttendance } from "../../api/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";

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

  // Filter out mentor-override marker
  const real = attendanceData.filter(a => a.month !== "MENTOR_OVERRIDE");

  if (!real.length) return <div className={readOnly ? "" : "page"}>{!readOnly && <><div className="page-heading">Attendance</div><div className="page-sub">Academic Year 2024–25</div></>}<div className="page-sub" style={{ marginTop: 20 }}>No attendance data found.</div></div>;

  // Compute overall %
  const totalPresent = real.reduce((a, m) => a + (m.days_present ?? 0), 0);
  const totalDays    = real.reduce((a, m) => a + (m.days_present ?? 0) + (m.days_absent ?? 0), 0);
  const overall      = totalDays > 0
    ? Math.round((totalPresent / totalDays) * 100)
    : Math.round(real.reduce((s, a) => s + a.percentage, 0) / real.length);

  // Chart data — use stored percentage directly
  const chartData = real.map(a => ({
    month:      a.month,
    percentage: a.percentage ?? (
      a.days_present != null && (a.days_present + a.days_absent) > 0
        ? Math.round((a.days_present / (a.days_present + a.days_absent)) * 100)
        : 0
    )
  }));

  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Attendance</div>
          <div className="page-sub">Academic Year 2024–25</div>
        </>
      )}

      {/* Only overall attendance % stat */}
      <div className="stat-row" style={{ gridTemplateColumns: "1fr", marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: overall < 75 ? "var(--red-mid)" : "var(--red)" }}>
            {overall}%
          </div>
          <div className="stat-label">Overall Attendance</div>
          <div style={{ fontSize: 12, color: overall < 75 ? "var(--red-mid)" : "#15803d", marginTop: 4 }}>
            {overall < 75 ? "⚠️ Below 75% threshold" : "✅ Eligible"}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">📈 Monthly Attendance Trend</div>
        </div>
        <div className="wcard-body">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
              <ReferenceLine
                y={75}
                stroke="#ef4444"
                strokeDasharray="5 3"
                label={{ value: "75%", fill: "#ef4444", fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="var(--red)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--red)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
