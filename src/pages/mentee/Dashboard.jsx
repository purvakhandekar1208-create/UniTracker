import { useState, useEffect } from "react";
import { Icons } from "../../assets/Icons";
import { getMenteeDashboard, getMenteeRemarks } from "../../api/api";

export default function Dashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [remarks,   setRemarks]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getMenteeDashboard(), getMenteeRemarks()])
      .then(([dash, rem]) => { setDashboard(dash); setRemarks(rem); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="page-sub">Loading dashboard...</div></div>;

  const certs = dashboard?.certificates || [];

  return (
    <div className="page">
      {/* Stat Cards */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { Icon: Icons.Calendar, value: dashboard?.attendance ?? "—",   label: "Attendance"  },
          { Icon: Icons.Chart,    value: dashboard?.gpa        ?? "—",   label: "Current GPA" },
          { Icon: Icons.Award,    value: dashboard?.certCount  ?? certs.length, label: "Uploaded" },
        ].map(({ Icon, value, label }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon-circle"><Icon /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Uploads */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">Recent Uploads List</div>
        </div>
        {certs.length === 0 ? (
          <div className="wcard-body"><div className="page-sub">No certificates uploaded yet.</div></div>
        ) : (
          <ul className="recent-list">
            {certs.slice(0, 5).map((cert, i) => (
              <li key={cert.id} className="recent-item">
                <div>
                  <span className="recent-num">{i + 1}.</span>
                  <span className="recent-name">{cert.title ?? cert.name}</span>
                </div>
                {cert.file_path && (
                  <a href={`http://localhost:8081/api/files/certificates/${cert.id}`}
                     target="_blank" rel="noreferrer" className="btn-view-pdf">
                    View PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mentor Remarks */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">💬 Mentor Remarks</div>
        </div>
        <div className="wcard-body">
          {remarks.length === 0 ? (
            <div className="page-sub">No remarks from your mentor yet.</div>
          ) : (
            remarks.map((r) => (
              <div className="remark-card" key={r.id}>
                <div className="remark-meta">{r.mentor_name} · {r.remark_date}</div>
                <div className="remark-text">{r.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
