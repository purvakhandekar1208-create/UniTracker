import { Avatar, Icons } from "../../assets/Icons";
import { MOCK_MENTEES, BATCHES } from "../../api/mockData";

export default function Dashboard({ onViewMentee }) {
  const lowAttendance = MOCK_MENTEES.filter((m) => m.attendance < 75);

  return (
    <div className="page">
      <div className="page-heading">Welcome back, Dr. Iyer</div>
      <div className="page-sub">Here's an overview of your mentees for this semester.</div>

      {/* Stats */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { Icon: Icons.Users,    value: MOCK_MENTEES.length, label: "Total Mentees"       },
          { Icon: Icons.Calendar, value: BATCHES.length,      label: "Active Batches"      },
          { Icon: Icons.Award,    value: 12,                  label: "Certificates"        },
          { Icon: Icons.Users,    value: lowAttendance.length, label: "Low Attendance ⚠️"  },
        ].map(({ Icon, value, label }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon-circle"><Icon /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Attendance overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="wcard">
          <div className="wcard-head"><div className="wcard-title">Attendance Overview</div></div>
          <div className="wcard-body">
            {MOCK_MENTEES.map((m) => (
              <div key={m.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>{m.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: m.attendance < 75 ? "var(--red-mid)" : "#15803d" }}>
                    {m.attendance}%
                  </span>
                </div>
                <div className="progress-wrap">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${m.attendance}%`,
                      background: m.attendance < 75 ? "var(--red-mid)" : "var(--red)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low attendance alerts */}
        <div className="wcard">
          <div className="wcard-head"><div className="wcard-title">⚠️ Needs Attention</div></div>
          <div className="wcard-body">
            {lowAttendance.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 14 }}>
                All mentees are above 75% attendance 🎉
              </div>
            ) : (
              lowAttendance.map((m) => (
                <div
                  key={m.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                  onClick={() => onViewMentee(m)}
                >
                  <Avatar name={m.name} size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "var(--red-mid)" }}>
                      Attendance: {m.attendance}% · Div {m.div}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
