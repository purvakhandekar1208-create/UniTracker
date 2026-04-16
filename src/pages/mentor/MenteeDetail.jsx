import { useState, useEffect } from "react";
import { Avatar } from "../../assets/Icons";
import {
  getMenteeMarksById,
  getMenteeAttendanceById,
  getMenteeCertsById,
  getMenteeRemarksById,
  getMenteeGpaById,
  addRemark,
  addMenteeAttendanceRecord
} from "../../api/api";
import Certificates from "../mentee/Certificates";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";

const TABS = ["marks", "attendance", "certificates", "remarks", "profile"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ── Remarks tab ────────────────────────────────────────────────────────────────
function RemarksTab({ mentee }) {
  const [remarks,  setRemarks]  = useState([]);
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(true);
  const [posting,  setPosting]  = useState(false);

  useEffect(() => {
    getMenteeRemarksById(mentee.id)
      .then(setRemarks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mentee.id]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const r = await addRemark(mentee.id, text);
      setRemarks(prev => [r, ...prev]);
      setText("");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally { setPosting(false); }
  };

  return (
    <div>
      <div className="wcard" style={{ marginBottom: 16 }}>
        <div className="wcard-head"><div className="wcard-title">Add Remark for {mentee.name}</div></div>
        <div className="wcard-body">
          <textarea className="form-input" rows={4} style={{ resize: "vertical" }}
            placeholder="Write your observation or feedback..."
            value={text} onChange={e => setText(e.target.value)} />
          <button className="btn-red" onClick={handlePost} disabled={posting} style={{ marginTop: 10 }}>
            {posting ? "Posting..." : "Post Remark"}
          </button>
        </div>
      </div>
      <div className="wcard">
        <div className="wcard-head"><div className="wcard-title">Previous Remarks</div></div>
        <div className="wcard-body">
          {loading ? <div className="page-sub">Loading...</div> :
           remarks.length === 0 ? <div className="page-sub">No remarks yet.</div> :
           remarks.map(r => (
            <div className="remark-card" key={r.id}>
              <div className="remark-meta">{r.mentor_name ?? "Mentor"} · {r.remark_date}</div>
              <div className="remark-text">{r.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Profile tab ────────────────────────────────────────────────────────────────
const YEAR_LABELS = { "1": "1st Year", "2": "2nd Year", "3": "3rd Year", "4": "4th Year" };
const SEM_LABELS  = { "1": "Sem 1", "2": "Sem 2", "3": "Sem 3", "4": "Sem 4",
                      "5": "Sem 5", "6": "Sem 6", "7": "Sem 7", "8": "Sem 8" };

function ReadField({ label, value }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ background:"#f3f4f6", border:"1.5px solid var(--border)", borderRadius:6,
                    padding:"10px 13px", fontSize:14, color:"var(--muted)", cursor:"default" }}>
        {value || "—"}
      </div>
    </div>
  );
}

function ProfileTab({ mentee }) {
  const yearVal = mentee.year     ? String(mentee.year)     : "";
  const semVal  = mentee.semester ? String(mentee.semester) : "";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Header card */}
      <div className="wcard">
        <div className="wcard-body">
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <Avatar name={mentee.name} size={70} />
            <div>
              <div style={{ fontFamily:"var(--font-head)", fontSize:22, fontWeight:700 }}>{mentee.name}</div>
              <div style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>
                Roll No: {mentee.roll ?? "—"} · Div: {mentee.division ?? mentee.div ?? "—"}
              </div>
              <div style={{ marginTop:8 }}>
                <span className="badge badge-red">Division {mentee.division ?? mentee.div ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="wcard">
        <div className="wcard-head"><div className="wcard-title">Account Info</div></div>
        <div className="wcard-body">
          <div className="form-grid">
            <ReadField label="Full Name" value={mentee.name} />
            <ReadField label="Email"     value={mentee.email} />
            <ReadField label="Role"      value={mentee.role} />
          </div>
        </div>
      </div>

      {/* Contact Numbers + Parent Emails */}
      <div className="wcard">
        <div className="wcard-head"><div className="wcard-title">📱 Contact Numbers &amp; Emails</div></div>
        <div className="wcard-body">
          <div className="form-grid">
            <ReadField label="Student Phone"                 value={mentee.phone} />
            <ReadField label="Parent / Guardian 1 Phone"    value={mentee.parent1Phone ?? mentee.parent1_phone} />
            <ReadField label="Parent / Guardian 1 Email"    value={mentee.parent1Email ?? mentee.parent1_email} />
            <ReadField label="Parent / Guardian 2 Phone"    value={mentee.parent2Phone ?? mentee.parent2_phone} />
            <ReadField label="Parent / Guardian 2 Email"    value={mentee.parent2Email ?? mentee.parent2_email} />
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="wcard">
        <div className="wcard-head"><div className="wcard-title">🎓 Academic Details</div></div>
        <div className="wcard-body">
          <div className="form-group">
            <label className="form-label">Department / Branch</label>
            <div style={{ background:"#f3f4f6", border:"1.5px solid var(--border)", borderRadius:6,
                          padding:"10px 13px", fontSize:14, color:"var(--muted)" }}>
              {mentee.department || "—"}
            </div>
          </div>
          <div className="form-grid" style={{ marginTop:12 }}>
            <ReadField label="Batch"       value={mentee.batch} />
            <ReadField label="Year"        value={YEAR_LABELS[yearVal]} />
            <ReadField label="Semester"    value={SEM_LABELS[semVal]} />
            <ReadField label="Roll Number" value={mentee.roll} />
            <ReadField label="Division"    value={mentee.division ?? mentee.div} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attendance tab (mentor view) ───────────────────────────────────────────────
const MONTH_OPTS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function MentorAttendanceTab({ menteeId }) {
  const [attData, setAttData]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [month,   setMonth]     = useState(MONTH_OPTS[new Date().getMonth()]);
  const [pct,     setPct]       = useState("");
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [err,     setErr]       = useState("");

  useEffect(() => {
    getMenteeAttendanceById(menteeId)
      .then(setAttData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [menteeId]);

  const chartData = attData
    .filter(a => a.month !== "MENTOR_OVERRIDE")
    .map(a => ({ month: a.month, percentage: a.percentage }));

  const avg = chartData.length
    ? Math.round(chartData.reduce((s, a) => s + a.percentage, 0) / chartData.length)
    : 0;

  const handleUpdate = async () => {
    const val = Number(pct);
    if (!month) { setErr("Please select a month."); return; }
    if (isNaN(val) || val < 0 || val > 100) { setErr("Percentage must be 0–100."); return; }
    setErr(""); setSaving(true);
    try {
      const saved_rec = await addMenteeAttendanceRecord(menteeId, month, val);
      setAttData(prev => {
        const without = prev.filter(a => a.month !== saved_rec.month);
        return [...without, saved_rec];
      });
      setPct("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr(e.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-sub">Loading attendance...</div>;

  return (
    <div>
      {/* Stat: overall % only */}
      <div className="stat-row" style={{ gridTemplateColumns: "1fr", marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: avg < 75 ? "var(--red-mid)" : "var(--red)" }}>
            {avg}%
          </div>
          <div className="stat-label">Average Attendance</div>
          <div style={{ fontSize: 12, color: avg < 75 ? "var(--red-mid)" : "#15803d", marginTop: 4 }}>
            {avg < 75 ? "⚠️ Below 75% threshold" : "✅ Eligible"}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      {chartData.length > 0 && (
        <div className="wcard" style={{ marginBottom: 20 }}>
          <div className="wcard-head"><div className="wcard-title">📈 Monthly Attendance Trend</div></div>
          <div className="wcard-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "75%", fill: "#ef4444", fontSize: 11 }} />
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
      )}

      {/* Update Attendance Form */}
      <div className="wcard">
        <div className="wcard-head"><div className="wcard-title">✏️ Update Attendance</div></div>
        <div className="wcard-body">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{ minWidth: 150 }}
              >
                {MONTH_OPTS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Attendance %</label>
              <input
                className="form-input"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 85"
                value={pct}
                onChange={e => setPct(e.target.value)}
                style={{ width: 120 }}
              />
            </div>
            <button
              className="btn-red"
              onClick={handleUpdate}
              disabled={saving}
              style={{ padding: "10px 22px" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          {err    && <div style={{ color: "var(--red-mid)", fontSize: 13, marginTop: 10 }}>{err}</div>}
          {saved  && <div style={{ color: "#15803d", fontSize: 13, marginTop: 10 }}>✅ Attendance updated!</div>}

          {/* Mini table of existing records */}
          {chartData.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>
                Existing Records
              </div>
              <table>
                <thead>
                  <tr><th>Month</th><th>Attendance %</th></tr>
                </thead>
                <tbody>
                  {chartData.map(a => (
                    <tr key={a.month}>
                      <td>{a.month}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: a.percentage < 75 ? "var(--red-mid, #ef4444)" : "#15803d"
                        }}>
                          {a.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Marks tab (mentor read-only) ───────────────────────────────────────────────
function MentorMarksTab({ menteeId, marksData }) {
  const [gpaData, setGpaData] = useState([]);
  const [gpaLoading, setGpaLoading] = useState(true);
  const [tab, setTab] = useState("gpa");

  useEffect(() => {
    getMenteeGpaById(menteeId)
      .then(setGpaData)
      .catch(console.error)
      .finally(() => setGpaLoading(false));
  }, [menteeId]);

  // Build a map semester → record
  const gpaMap = {};
  gpaData.forEach(r => { gpaMap[r.semester] = r; });

  // Latest CGPA
  const latestCgpa = (() => {
    for (let s = 8; s >= 1; s--) {
      if (gpaMap[s]?.cgpa != null) return gpaMap[s].cgpa;
    }
    return null;
  })();

  return (
    <div>
      <div className="tabs-bar" style={{ marginBottom: 20 }}>
        <div className={`tab-item ${tab === "gpa" ? "active" : ""}`} onClick={() => setTab("gpa")}>
          CGPA / SGPA
        </div>
        <div className={`tab-item ${tab === "marks" ? "active" : ""}`} onClick={() => setTab("marks")}>
          Subject Marks
        </div>
      </div>

      {tab === "gpa" && (
        <div>
          {/* Stat */}
          <div className="stat-row" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-value">{latestCgpa != null ? parseFloat(latestCgpa).toFixed(2) : "—"}</div>
              <div className="stat-label">Current CGPA</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{gpaData.filter(r => r.sgpa != null).length} / 8</div>
              <div className="stat-label">Semesters Filled</div>
            </div>
          </div>

          {gpaLoading ? (
            <div className="page-sub">Loading GPA data...</div>
          ) : (
            <div className="wcard">
              <div className="wcard-head"><div className="wcard-title">Semester-wise GPA</div></div>
              <table>
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>SGPA</th>
                    <th>CGPA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SEMESTERS.map(sem => {
                    const rec    = gpaMap[sem];
                    const filled = rec?.sgpa != null || rec?.cgpa != null;
                    return (
                      <tr key={sem}>
                        <td><span style={{ fontWeight: 600 }}>Semester {sem}</span></td>
                        <td style={{ fontWeight: rec?.sgpa ? 700 : 400, color: rec?.sgpa ? "var(--text)" : "var(--muted)" }}>
                          {rec?.sgpa ?? "—"}
                        </td>
                        <td style={{ fontWeight: rec?.cgpa ? 700 : 400, color: rec?.cgpa ? "var(--text)" : "var(--muted)" }}>
                          {rec?.cgpa ?? "—"}
                        </td>
                        <td>
                          {filled
                            ? <span className="badge badge-green" style={{ background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac" }}>Filled</span>
                            : <span className="badge" style={{ background:"#f3f4f6",color:"var(--muted)",border:"1px solid var(--border)" }}>Empty</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "marks" && (
        <div>
          {!marksData || marksData.length === 0 ? (
            <div className="wcard">
              <div className="wcard-body"><div className="page-sub">No subject marks found.</div></div>
            </div>
          ) : (
            <div>
              <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
                {[
                  ["Subjects",      marksData.length],
                  ["Highest Mark",  `${Math.max(...marksData.map(m => m.total_marks ?? 0))} / 100`],
                  ["Lowest Mark",   `${Math.min(...marksData.map(m => m.total_marks ?? 0))} / 100`],
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
                    {marksData.map(m => (
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
          )}
        </div>
      )}
    </div>
  );
}

// ── Main MenteeDetail ──────────────────────────────────────────────────────────
export default function MenteeDetail({ mentee, onBack }) {
  const [activeTab,   setActiveTab]   = useState("marks");
  const [marksData,   setMarksData]   = useState(null);
  const [certsData,   setCertsData]   = useState(null);
  const [attData,     setAttData]     = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    setDataLoading(true);
    Promise.all([
      getMenteeMarksById(mentee.id),
      getMenteeCertsById(mentee.id),
      getMenteeAttendanceById(mentee.id),
    ]).then(([marks, certs, att]) => {
      setMarksData(marks);
      setCertsData(certs);
      setAttData(att);
    }).catch(console.error)
      .finally(() => setDataLoading(false));
  }, [mentee.id]);

  const visibleAtt = (attData || []).filter(a => a.month !== "MENTOR_OVERRIDE");
  const avgAtt = visibleAtt.length
    ? Math.round(visibleAtt.reduce((s, a) => s + (a.percentage ?? 0), 0) / visibleAtt.length)
    : (mentee.avg_attendance ?? "—");

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← Back to Mentees</button>

      {/* Header */}
      <div className="mentee-profile-hdr">
        <Avatar name={mentee.name} size={60} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily:"var(--font-head)", fontSize:20, fontWeight:700 }}>{mentee.name}</div>
          <div style={{ fontSize:13, color:"var(--muted)", marginTop:3 }}>
            Roll: {mentee.roll ?? "—"} · Div: {mentee.division ?? mentee.div ?? "—"} · {mentee.email}
          </div>
        </div>
        {[
          ["Attendance", `${avgAtt}%`],
          ["Certs",      certsData?.length ?? "—"],
        ].map(([label, value]) => (
          <div className="mentee-hdr-stat" key={label}>
            <div className="mentee-hdr-stat-val">{value}</div>
            <div className="mentee-hdr-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map(t => (
          <div key={t} className={`tab-item ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {dataLoading ? (
        <div className="page-sub" style={{ padding: 24 }}>Loading mentee data...</div>
      ) : (
        <>
          {activeTab === "marks"        && <MentorMarksTab     menteeId={mentee.id} marksData={marksData} />}
          {activeTab === "attendance"   && <MentorAttendanceTab menteeId={mentee.id} />}
          {activeTab === "certificates" && <Certificates readOnly data={certsData} />}
          {activeTab === "remarks"      && <RemarksTab   mentee={mentee} />}
          {activeTab === "profile"      && <ProfileTab   mentee={mentee} />}
        </>
      )}
    </div>
  );
}
