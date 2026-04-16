import { useState, useEffect } from "react";
import { Icons } from "../../assets/Icons";
import { getMenteeDashboard } from "../../api/api";

export default function Dashboard({ user, onNavigate }) {
  const [dash,    setDash]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenteeDashboard()
      .then(setDash)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="page-sub">Loading dashboard...</div></div>;

  const certs   = dash?.certificates || [];
  const remarks = dash?.remarks       || [];

  // Profile completeness check
  const missing = [];
  if (!dash?.phone)        missing.push("your phone number");
  if (!dash?.parent1Phone) missing.push("Parent 1 phone");
  if (!dash?.parent2Phone) missing.push("Parent 2 phone");
  const profileComplete = missing.length === 0;

  // CGPA from DB
  const cgpaDisplay = dash?.cgpa != null ? parseFloat(dash.cgpa).toFixed(2) : "—";

  return (
    <div className="page">

      {/* Profile incomplete banner */}
      {!profileComplete && (
        <div style={{
          background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8,
          padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center",
          gap: 12, fontSize: 13
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <strong>Complete your profile!</strong> Still missing: {missing.join(", ")}.
            {" "}<span
              onClick={() => onNavigate("profilesettings")}
              style={{ color: "var(--red)", textDecoration: "underline", cursor: "pointer" }}
            >
              Go to Profile Settings →
            </span>
          </div>
        </div>
      )}

      {/* Academic info banner */}
      {(dash?.department || dash?.batch) && (
        <div className="wcard" style={{ marginBottom: 20, background: "var(--red)", color: "#fff" }}>
          <div className="wcard-body" style={{ display: "flex", flexWrap: "wrap", gap: "10px 32px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em" }}>Department</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{dash.department || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em" }}>Year / Sem</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {dash.year ? `Year ${dash.year}` : "—"}{dash.semester ? ` / Sem ${dash.semester}` : ""}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em" }}>Roll No</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{dash.roll || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em" }}>Division</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{dash.division || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em" }}>Batch</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{dash.batch || "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards — CGPA now real from DB */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { Icon: Icons.Calendar, value: dash?.avg_attendance != null ? `${dash.avg_attendance}%` : "—", label: "Attendance" },
          { Icon: Icons.Chart,    value: cgpaDisplay,                                                     label: "CGPA" },
          { Icon: Icons.Award,    value: dash?.certificate_count ?? certs.length,                        label: "Certificates" },
        ].map(({ Icon, value, label }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon-circle"><Icon /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Assigned Mentor — from API batch-based lookup */}
      <div className="wcard" style={{ marginTop: 20 }}>
        <div className="wcard-head"><div className="wcard-title">👨‍🏫 Assigned Mentor</div></div>
        <div className="wcard-body">
          {dash?.mentor ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--red-lite)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{dash.mentor.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{dash.mentor.email}</div>
                {dash.batch && (
                  <div style={{ fontSize: 11, marginTop: 2, color: "var(--muted)" }}>
                    Batch: <strong>{dash.batch}</strong>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              No mentor assigned yet. You will be assigned a mentor once you join a batch.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        {/* Recent certificates */}
        <div className="wcard">
          <div className="wcard-head"><div className="wcard-title">Recent Certificates</div></div>
          {certs.length === 0 ? (
            <div className="wcard-body"><div className="page-sub">No certificates uploaded yet.</div></div>
          ) : (
            <ul className="recent-list">
              {certs.slice(0, 5).map((cert, i) => {
                return (
                  <li key={cert.id} className="recent-item">
                    <div>
                      <span className="recent-num">{i + 1}.</span>
                      <span className="recent-name">{cert.title ?? cert.name}</span>
                    </div>
                    <button
                      className="btn-view-pdf"
                      onClick={() => onNavigate("certificates", { certId: cert.id })}
                    >
                      View
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Mentor remarks */}
        <div className="wcard">
          <div className="wcard-head"><div className="wcard-title">💬 Mentor Remarks</div></div>
          <div className="wcard-body">
            {remarks.length === 0 ? (
              <div className="page-sub">No remarks from your mentor yet.</div>
            ) : remarks.map(r => (
              <div className="remark-card" key={r.id}>
                <div className="remark-meta">{r.mentor_name} · {r.remark_date}</div>
                <div className="remark-text">{r.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
