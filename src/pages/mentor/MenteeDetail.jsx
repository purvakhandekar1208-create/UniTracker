import { useState } from "react";
import { Avatar } from "../../assets/Icons";
import Marks        from "../mentee/Marks";
import Certificates from "../mentee/Certificates";
import Courses      from "../mentee/Courses";
import Attendance   from "../mentee/Attendance";

const TABS = ["marks", "certificates", "courses", "attendance", "profile"];

function ProfileTab({ mentee }) {
  return (
    <div className="wcard">
      <div className="wcard-body">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <Avatar name={mentee.name} size={70} />
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700 }}>
              {mentee.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              Roll No: {mentee.roll} · Div: {mentee.div}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className="badge badge-red">Division {mentee.div}</span>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="form-grid">
          {[
            ["Full Name",    mentee.name  ],
            ["Roll Number",  mentee.roll  ],
            ["Division",     mentee.div   ],
            ["Email",        mentee.email ],
            ["Phone",        mentee.phone ],
            ["Batch",        mentee.batch ],
          ].map(([label, value]) => (
            <div className="form-group" key={label}>
              <label className="form-label">{label}</label>
              <div style={{ background: "#fafafa", border: "1.5px solid var(--border)", borderRadius: 6, padding: "10px 13px", fontSize: 14 }}>
                {value || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MenteeDetail({ mentee, onBack }) {
  const [activeTab, setActiveTab] = useState("marks");

  return (
    <div className="page">
      {/* Back button */}
      <button className="back-btn" onClick={onBack}>← Back to Mentees</button>

      {/* Mentee header card */}
      <div className="mentee-profile-hdr">
        <Avatar name={mentee.name} size={60} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700 }}>
            {mentee.name}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
            Roll: {mentee.roll} · Div: {mentee.div} · {mentee.email}
          </div>
        </div>
        {[
          ["Attendance", `${mentee.attendance}%`],
          ["GPA",        mentee.gpa            ],
          ["Certs",      mentee.certs          ],
        ].map(([label, value]) => (
          <div className="mentee-hdr-stat" key={label}>
            <div className="mentee-hdr-stat-val">{value}</div>
            <div className="mentee-hdr-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map((t) => (
          <div
            key={t}
            className={`tab-item ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* Tab content — all read-only for mentor */}
      {activeTab === "marks"        && <Marks        readOnly />}
      {activeTab === "certificates" && <Certificates readOnly />}
      {activeTab === "courses"      && <Courses      readOnly />}
      {activeTab === "attendance"   && <Attendance   readOnly />}
      {activeTab === "profile"      && <ProfileTab   mentee={mentee} />}
    </div>
  );
}
