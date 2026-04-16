import { useState, useEffect } from "react";
import { getMenteeGpa, saveMenteeGpa, getUser } from "../../api/api";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ── GPA Section (DB-backed) ───────────────────────────────────────────────────
function GpaSection({ currentSem }) {
  // gpaMap: { [sem]: { sgpa, cgpa } | null }
  const [gpaMap,   setGpaMap]   = useState({});
  const [loaded,   setLoaded]   = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [draft,    setDraft]    = useState({ sgpa: "", cgpa: "" });
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  // Load from DB on mount
  useEffect(() => {
    getMenteeGpa()
      .then(records => {
        const map = {};
        records.forEach(r => { map[r.semester] = { sgpa: r.sgpa ?? "", cgpa: r.cgpa ?? "" }; });
        setGpaMap(map);
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  const startEdit = (sem) => {
    setEditing(sem);
    const existing = gpaMap[sem] || { sgpa: "", cgpa: "" };
    setDraft({ sgpa: String(existing.sgpa ?? ""), cgpa: String(existing.cgpa ?? "") });
    setSaved(false);
  };

  const handleSave = async (sem) => {
    const sg = draft.sgpa !== "" ? parseFloat(draft.sgpa) : null;
    const cg = draft.cgpa !== "" ? parseFloat(draft.cgpa) : null;
    if (sg != null && (isNaN(sg) || sg < 0 || sg > 10)) { alert("SGPA must be between 0 and 10"); return; }
    if (cg != null && (isNaN(cg) || cg < 0 || cg > 10)) { alert("CGPA must be between 0 and 10"); return; }

    setSaving(true);
    try {
      await saveMenteeGpa(sem, sg, cg);
      setGpaMap(prev => ({ ...prev, [sem]: { sgpa: sg ?? "", cgpa: cg ?? "" } }));
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Failed to save: " + e.message);
    } finally { setSaving(false); }
  };

  const handleCancel = () => { setEditing(null); setDraft({ sgpa: "", cgpa: "" }); };

  const latestCgpa = (() => {
    for (let s = 8; s >= 1; s--) {
      if (gpaMap[s]?.cgpa !== "" && gpaMap[s]?.cgpa != null) return gpaMap[s].cgpa;
    }
    return null;
  })();

  return (
    <div>
      {/* Stat bar */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
        {[
          { label: "Current CGPA",      value: latestCgpa != null ? parseFloat(latestCgpa).toFixed(2) : "—" },
          { label: "Current Semester",  value: currentSem ? `Sem ${currentSem}` : "—" },
          { label: "Semesters Filled",  value: SEMESTERS.filter(s => gpaMap[s]?.sgpa !== "" && gpaMap[s]?.sgpa != null).length + " / 8" },
        ].map(({ label, value }) => (
          <div className="stat-card" key={label}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {saved && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "9px 14px", fontSize: 13, color: "#15803d", marginBottom: 16 }}>
          ✅ GPA saved to database!
        </div>
      )}

      {!loaded && <div className="page-sub">Loading GPA data...</div>}

      {loaded && (
        <div className="wcard">
          <div className="wcard-head">
            <div className="wcard-title">Semester-wise GPA</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Click any row to edit</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>SGPA <span style={{ fontWeight: 400, color: "var(--muted)" }}>(0–10)</span></th>
                <th>CGPA <span style={{ fontWeight: 400, color: "var(--muted)" }}>(Cumulative)</span></th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {SEMESTERS.map(sem => {
                const isEditing = editing === sem;
                const entry     = gpaMap[sem];
                const filled    = entry?.sgpa !== "" && entry?.sgpa != null;
                const isCurrent = currentSem === sem;

                return (
                  <tr key={sem} style={{ background: isCurrent ? "var(--red-lite)" : "" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>Semester {sem}</span>
                        {isCurrent && (
                          <span style={{ fontSize: 10, background: "var(--red)", color: "#fff", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>
                            CURRENT
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="number" min="0" max="10" step="0.01"
                          className="form-input" style={{ width: 90, padding: "6px 10px", fontSize: 13 }}
                          placeholder="e.g. 8.5"
                          value={draft.sgpa}
                          onChange={e => setDraft(p => ({ ...p, sgpa: e.target.value }))}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontWeight: entry?.sgpa ? 700 : 400, color: entry?.sgpa ? "var(--text)" : "var(--muted)" }}>
                          {entry?.sgpa || "—"}
                        </span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="number" min="0" max="10" step="0.01"
                          className="form-input" style={{ width: 90, padding: "6px 10px", fontSize: 13 }}
                          placeholder="e.g. 8.2"
                          value={draft.cgpa}
                          onChange={e => setDraft(p => ({ ...p, cgpa: e.target.value }))}
                        />
                      ) : (
                        <span style={{ fontWeight: entry?.cgpa ? 700 : 400, color: entry?.cgpa ? "var(--text)" : "var(--muted)" }}>
                          {entry?.cgpa || "—"}
                        </span>
                      )}
                    </td>

                    <td>
                      {filled
                        ? <span className="badge badge-green" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" }}>Filled</span>
                        : <span className="badge" style={{ background: "#f3f4f6", color: "var(--muted)", border: "1px solid var(--border)" }}>Empty</span>
                      }
                    </td>

                    <td style={{ textAlign: "right" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button onClick={() => handleSave(sem)} disabled={saving} className="btn-red" style={{ padding: "5px 12px", fontSize: 12 }}>
                            {saving ? "…" : "Save"}
                          </button>
                          <button onClick={handleCancel} style={{ padding: "5px 12px", fontSize: 12, border: "1.5px solid var(--border)", borderRadius: 6, background: "#fff", cursor: "pointer" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(sem)} style={{ padding: "5px 12px", fontSize: 12, border: "1.5px solid var(--border)", borderRadius: 6, background: "#fff", cursor: "pointer", color: "var(--red)", fontWeight: 600 }}>
                          {filled ? "Edit" : "+ Add"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Marks Page (CGPA/SGPA only — Subject Marks tab removed per spec) ──────
export default function Marks({ readOnly = false, data = null, menteeId = null }) {
  const user       = getUser();
  const currentSem = user?.semester || 0;

  // readOnly = true means this is for mentor view — handled in MenteeDetail directly now
  if (readOnly) return null;

  return (
    <div>
      <div className="page-heading">Academic Performance</div>
      <div className="page-sub">Track your semester GPA — saved to your account</div>

      <GpaSection currentSem={currentSem} />
    </div>
  );
}