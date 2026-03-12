import { useState, useEffect } from "react";
import { Avatar, Icons } from "../../assets/Icons";
import { getAllMentees, getUser } from "../../api/api";

export default function Dashboard({ onViewMentee }) {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const mentor = getUser(); // logged-in mentor from localStorage

  useEffect(() => {
    getAllMentees()
      .then(setMentees)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="page-sub">Loading dashboard...</div></div>;

  const lowAttendance = mentees.filter(m => (m.avg_attendance ?? 100) < 75);
  const totalCerts    = mentees.reduce((a, m) => a + (m.cert_count ?? 0), 0);

  return (
    <div className="page">
      <div className="page-heading">Welcome back, {mentor?.name ?? "Mentor"}</div>
      <div className="page-sub">Here's an overview of your mentees for this semester.</div>

      <div className="stat-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { Icon: Icons.Users,    value: mentees.length,       label: "Total Mentees"     },
          { Icon: Icons.Calendar, value: 2,                    label: "Active Batches"    },
          { Icon: Icons.Award,    value: totalCerts,           label: "Total Certificates"},
          { Icon: Icons.Users,    value: lowAttendance.length, label: "Low Attendance ⚠️"},
        ].map(({ Icon, value, label }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon-circle"><Icon /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="wcard">
          <div className="wcard-head"><div className="wcard-title">Attendance Overview</div></div>
          <div className="wcard-body">
            {mentees.length === 0 ? (
              <div className="page-sub">No mentees assigned yet.</div>
            ) : mentees.map(m => {
              const att = m.avg_attendance ?? 0;
              return (
                <div key={m.id} style={{ marginBottom: 14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:13 }}>{m.name}</span>
                    <span style={{ fontSize:12, fontWeight:600, color: att < 75 ? "var(--red-mid)" : "#15803d" }}>
                      {att}%
                    </span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-bar" style={{ width:`${att}%`, background: att < 75 ? "var(--red-mid)" : "var(--red)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="wcard">
          <div className="wcard-head"><div className="wcard-title">⚠️ Needs Attention</div></div>
          <div className="wcard-body">
            {lowAttendance.length === 0 ? (
              <div style={{ color:"var(--muted)", fontSize:14 }}>All mentees above 75% attendance 🎉</div>
            ) : lowAttendance.map(m => (
              <div key={m.id}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border)", cursor:"pointer" }}
                onClick={() => onViewMentee(m)}
              >
                <Avatar name={m.name} size={36} />
                <div>
                  <div style={{ fontSize:14, fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontSize:12, color:"var(--red-mid)" }}>
                    Attendance: {m.avg_attendance}% · {m.division ? `Div ${m.division}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
