import { useState, useEffect } from "react";
import { Avatar } from "../../assets/Icons";
import { getMenteeMarksById, getMenteeAttendanceById, getMenteeCertsById, getMenteeRemarksById, addRemark } from "../../api/api";
import Marks        from "../mentee/Marks";
import Certificates from "../mentee/Certificates";
import Attendance   from "../mentee/Attendance";

const TABS = ["marks", "certificates", "attendance", "remarks", "profile"];

// ── Remarks tab for mentor viewing a specific mentee ──────────────────────────
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

// ── Profile tab ───────────────────────────────────────────────────────────────
const YEAR_LABELS  = { "1": "1st Year", "2": "2nd Year", "3": "3rd Year", "4": "4th Year" };
const SEM_LABELS   = { "1": "Sem 1", "2": "Sem 2", "3": "Sem 3", "4": "Sem 4",
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

      {/* ── Header card ── */}
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

      {/* ── Account Info ── */}
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

      {/* ── Contact Numbers ── */}
      <div className="wcard">
        <div className="wcard-head"><div className="wcard-title">📱 Contact Numbers</div></div>
        <div className="wcard-body">
          <div className="form-grid">
            <ReadField label="Phone"                    value={mentee.phone} />
            <ReadField label="Parent / Guardian 1 Phone" value={mentee.parent1Phone ?? mentee.parent1_phone} />
            <ReadField label="Parent / Guardian 2 Phone" value={mentee.parent2Phone ?? mentee.parent2_phone} />
          </div>
        </div>
      </div>

      {/* ── Academic Details ── */}
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

// ── Main MenteeDetail ─────────────────────────────────────────────────────────
export default function MenteeDetail({ mentee, onBack }) {
  const [activeTab, setActiveTab] = useState("marks");
  const [marksData,  setMarksData]  = useState(null);
  const [certsData,  setCertsData]  = useState(null);
  const [attData,    setAttData]    = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Load all mentee data upfront
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

  // Compute avg attendance for header
  const avgAtt = attData?.length
    ? Math.round(attData.reduce((a, m) => a + (m.percentage ?? 0), 0) / attData.length)
    : (mentee.avg_attendance ?? mentee.attendance ?? "—");

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
          ["Certs",      certsData?.length   ?? "—"],
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
          {activeTab === "marks"        && <Marks        readOnly data={marksData}   />}
          {activeTab === "certificates" && <Certificates readOnly data={certsData}   />}
          {activeTab === "attendance"   && <Attendance   readOnly data={attData}     />}
          {activeTab === "remarks"      && <RemarksTab   mentee={mentee}             />}
          {activeTab === "profile"      && <ProfileTab   mentee={mentee}             />}
        </>
      )}
    </div>
  );
}


