// import { useState, useEffect } from "react";
// import { getMenteeMarks } from "../../api/api";

// export default function Marks({ readOnly = false, data = null }) {
//   const [marks,   setMarks]   = useState(data || []);
//   const [loading, setLoading] = useState(!data);

//   useEffect(() => {
//     if (data) { setMarks(data); return; }
//     if (!readOnly) {
//       getMenteeMarks()
//         .then(setMarks)
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }
//   }, [data, readOnly]);

//   if (loading) return <div className="page-sub">Loading marks...</div>;

//   const highest = marks.length ? Math.max(...marks.map((m) => m.total_marks ?? m.total ?? 0)) : "—";
//   const lowest  = marks.length ? Math.min(...marks.map((m) => m.total_marks ?? m.total ?? 0)) : "—";

//   return (
//     <div className={readOnly ? "" : "page"}>
//       {!readOnly && (
//         <>
//           <div className="page-heading">Academic Marks</div>
//           <div className="page-sub">Semester-wise subject marks and grades</div>
//         </>
//       )}

//       <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
//         {[
//           ["—",            "Current GPA"  ],
//           [`${highest}/100`, "Highest Mark"],
//           [`${lowest}/100`,  "Lowest Mark" ],
//         ].map(([v, l]) => (
//           <div className="stat-card" key={l}>
//             <div className="stat-value">{v}</div>
//             <div className="stat-label">{l}</div>
//           </div>
//         ))}
//       </div>

//       <div className="wcard">
//         <div className="wcard-head">
//           <div className="wcard-title">Subject Marks</div>
//           {!readOnly && <button className="btn-red">+ Add Marks</button>}
//         </div>
//         {marks.length === 0 ? (
//           <div className="wcard-body"><div className="page-sub">No marks data found.</div></div>
//         ) : (
//           <table>
//             <thead>
//               <tr>
//                 <th>Subject</th>
//                 <th>Internal (40)</th>
//                 <th>External (60)</th>
//                 <th>Total</th>
//                 <th>Grade</th>
//               </tr>
//             </thead>
//             <tbody>
//               {marks.map((m) => {
//                 const grade   = m.grade;
//                 const subject = m.subject_name ?? m.subject;
//                 const internal = m.internal_marks ?? m.internal;
//                 const external = m.external_marks ?? m.external;
//                 const total    = m.total_marks    ?? m.total;
//                 return (
//                   <tr key={subject}>
//                     <td>{subject}</td>
//                     <td>{internal}</td>
//                     <td>{external}</td>
//                     <td><strong>{total}</strong></td>
//                     <td>
//                       <span className={`badge ${["O", "A+"].includes(grade) ? "badge-green" : "badge-red"}`}>
//                         {grade}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { getMenteeMarks, getUser } from "../../api/api";

// CGPA/SGPA is stored locally per-user in localStorage
// Key: "gpa_<userId>_sem_<n>"

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function gpaKey(userId, sem) { return `gpa_${userId}_sem_${sem}`; }

function loadGpa(userId) {
  const result = {};
  SEMESTERS.forEach(s => {
    const val = localStorage.getItem(gpaKey(userId, s));
    result[s] = val ? JSON.parse(val) : { sgpa: "", cgpa: "" };
  });
  return result;
}

function saveGpaSem(userId, sem, data) {
  localStorage.setItem(gpaKey(userId, sem), JSON.stringify(data));
}

// ── GPA Entry Section ─────────────────────────────────────────────────────────
function GpaSection({ userId, currentSem }) {
  const [gpa,     setGpa]     = useState(() => loadGpa(userId));
  const [editing, setEditing] = useState(null);   // which sem is being edited
  const [draft,   setDraft]   = useState({ sgpa: "", cgpa: "" });
  const [saved,   setSaved]   = useState(false);

  const startEdit = (sem) => {
    setEditing(sem);
    setDraft({ ...gpa[sem] });
    setSaved(false);
  };

  const handleSave = (sem) => {
    // Validate: 0–10 range
    const sg = parseFloat(draft.sgpa);
    const cg = parseFloat(draft.cgpa);
    if (draft.sgpa && (isNaN(sg) || sg < 0 || sg > 10)) { alert("SGPA must be between 0 and 10"); return; }
    if (draft.cgpa && (isNaN(cg) || cg < 0 || cg > 10)) { alert("CGPA must be between 0 and 10"); return; }
    const updated = { ...gpa, [sem]: { sgpa: draft.sgpa, cgpa: draft.cgpa } };
    setGpa(updated);
    saveGpaSem(userId, sem, { sgpa: draft.sgpa, cgpa: draft.cgpa });
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => { setEditing(null); setDraft({ sgpa: "", cgpa: "" }); };

  // Latest filled CGPA for stat card
  const latestCgpa = (() => {
    for (let s = 8; s >= 1; s--) {
      if (gpa[s]?.cgpa) return gpa[s].cgpa;
    }
    return null;
  })();

  return (
    <div>
      {/* Stat bar */}
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
        {[
          { label: "Current CGPA",  value: latestCgpa ? parseFloat(latestCgpa).toFixed(2) : "—" },
          { label: "Current Semester", value: currentSem ? `Sem ${currentSem}` : "—" },
          { label: "Semesters Filled", value: SEMESTERS.filter(s => gpa[s]?.sgpa || gpa[s]?.cgpa).length + " / 8" },
        ].map(({ label, value }) => (
          <div className="stat-card" key={label}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {saved && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "9px 14px", fontSize: 13, color: "#15803d", marginBottom: 16 }}>
          ✅ GPA saved successfully!
        </div>
      )}

      {/* Semester grid */}
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
              const entry     = gpa[sem];
              const filled    = entry?.sgpa || entry?.cgpa;
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
                    {filled ? (
                      <span className="badge badge-green" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" }}>Filled</span>
                    ) : (
                      <span className="badge" style={{ background: "#f3f4f6", color: "var(--muted)", border: "1px solid var(--border)" }}>Empty</span>
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => handleSave(sem)} className="btn-red" style={{ padding: "5px 12px", fontSize: 12 }}>Save</button>
                        <button onClick={handleCancel} style={{ padding: "5px 12px", fontSize: 12, border: "1.5px solid var(--border)", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Cancel</button>
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
    </div>
  );
}

// ── Subject Marks Section ─────────────────────────────────────────────────────
function SubjectMarks({ data, readOnly }) {
  const [marks,   setMarks]   = useState(data || []);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) { setMarks(data); return; }
    if (!readOnly) {
      getMenteeMarks()
        .then(setMarks)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [data, readOnly]);

  if (loading) return <div className="page-sub">Loading subject marks...</div>;

  if (marks.length === 0) return (
    <div className="wcard">
      <div className="wcard-body"><div className="page-sub">No subject marks found.</div></div>
    </div>
  );

  const highest = Math.max(...marks.map(m => m.total_marks ?? 0));
  const lowest  = Math.min(...marks.map(m => m.total_marks ?? 0));

  return (
    <div>
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
        {[
          ["Subjects",     marks.length      ],
          ["Highest Mark", `${highest} / 100`],
          ["Lowest Mark",  `${lowest} / 100` ],
        ].map(([l, v]) => (
          <div className="stat-card" key={l}><div className="stat-value">{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="wcard">
        <div className="wcard-head"><div className="wcard-title">Subject Marks</div></div>
        <table>
          <thead>
            <tr><th>Subject</th><th>Internal (40)</th><th>External (60)</th><th>Total</th><th>Grade</th></tr>
          </thead>
          <tbody>
            {marks.map(m => (
              <tr key={m.id}>
                <td>{m.subject_name}</td>
                <td>{m.internal_marks}</td>
                <td>{m.external_marks}</td>
                <td><strong>{m.total_marks}</strong></td>
                <td>
                  <span className={`badge ${["O","A+"].includes(m.grade) ? "badge-green" : "badge-red"}`}>{m.grade}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Marks Page ───────────────────────────────────────────────────────────
export default function Marks({ readOnly = false, data = null, menteeId = null }) {
  const user       = getUser();
  const userId     = menteeId || user?.userId || user?.id;
  const currentSem = user?.semester || 0;

  const [tab, setTab] = useState("gpa");

  return (
    <div className={readOnly ? "" : ""}>
      {!readOnly && (
        <>
          <div className="page-heading">Academic Performance</div>
          <div className="page-sub">Track your GPA and subject marks</div>
        </>
      )}

      {/* Sub-tabs: GPA | Subject Marks */}
      <div className="tabs-bar" style={{ marginBottom: 20 }}>
        <div className={`tab-item ${tab === "gpa" ? "active" : ""}`} onClick={() => setTab("gpa")}>
          CGPA / SGPA
        </div>
        <div className={`tab-item ${tab === "marks" ? "active" : ""}`} onClick={() => setTab("marks")}>
          Subject Marks
        </div>
      </div>

      {tab === "gpa" && !readOnly && userId && (
        <GpaSection userId={userId} currentSem={currentSem} />
      )}

      {tab === "gpa" && readOnly && (
        <div className="wcard">
          <div className="wcard-body">
            <div className="page-sub">GPA data is self-reported by the student and stored locally on their device.</div>
          </div>
        </div>
      )}

      {tab === "marks" && (
        <SubjectMarks data={data} readOnly={readOnly} />
      )}
    </div>
  );
}