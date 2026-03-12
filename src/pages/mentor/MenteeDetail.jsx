import { useState, useEffect } from "react";
import { Avatar } from "../../assets/Icons";
import { getMenteeMarksById, getMenteeAttendanceById, getMenteeCertsById, getMenteeCoursesById, getMenteeRemarksById, addRemark } from "../../api/api";
import Marks        from "../mentee/Marks";
import Certificates from "../mentee/Certificates";
import Courses      from "../mentee/Courses";
import Attendance   from "../mentee/Attendance";

const TABS = ["marks", "certificates", "courses", "attendance", "remarks", "profile"];

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
function ProfileTab({ mentee }) {
  return (
    <div className="wcard">
      <div className="wcard-body">
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24, paddingBottom:24, borderBottom:"1px solid var(--border)" }}>
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
        <div className="form-grid">
          {[
            ["Full Name",   mentee.name],
            ["Email",       mentee.email],
            ["Phone",       mentee.phone],
            ["Roll Number", mentee.roll],
            ["Division",    mentee.division ?? mentee.div],
            ["Role",        mentee.role],
          ].map(([label, value]) => (
            <div className="form-group" key={label}>
              <label className="form-label">{label}</label>
              <div style={{ background:"#fafafa", border:"1.5px solid var(--border)", borderRadius:6, padding:"10px 13px", fontSize:14 }}>
                {value || "—"}
              </div>
            </div>
          ))}
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
  const [coursesData,setCoursesData]= useState(null);
  const [attData,    setAttData]    = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Load all mentee data upfront
  useEffect(() => {
    setDataLoading(true);
    Promise.all([
      getMenteeMarksById(mentee.id),
      getMenteeCertsById(mentee.id),
      getMenteeCoursesById(mentee.id),
      getMenteeAttendanceById(mentee.id),
    ]).then(([marks, certs, courses, att]) => {
      setMarksData(marks);
      setCertsData(certs);
      setCoursesData(courses);
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
          ["Courses",    coursesData?.length ?? "—"],
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
          {activeTab === "courses"      && <Courses      readOnly data={coursesData} />}
          {activeTab === "attendance"   && <Attendance   readOnly data={attData}     />}
          {activeTab === "remarks"      && <RemarksTab   mentee={mentee}             />}
          {activeTab === "profile"      && <ProfileTab   mentee={mentee}             />}
        </>
      )}
    </div>
  );
}
