import { useState } from "react";
import { MOCK_CERTS } from "../../api/mockData";

// readOnly = true  → mentor view inside MenteeDetail
// readOnly = false → mentee's own page
export default function Certificates({ readOnly = false }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Certificates</div>
          <div className="page-sub">Upload and manage your certificates</div>

          {/* Upload drop zone */}
          <div className="upload-zone" onClick={() => setShowForm(!showForm)}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              Drop certificate here or click to browse
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              PDF, PNG, JPG · Max 5MB
            </div>
            <button className="btn-red" style={{ marginTop: 14 }}>Browse File</button>
          </div>

          {/* Upload form */}
          {showForm && (
            <div className="wcard" style={{ marginBottom: 20 }}>
              <div className="wcard-head">
                <div className="wcard-title">Certificate Details</div>
              </div>
              <div className="wcard-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Certificate Name</label>
                    <input className="form-input" placeholder="e.g. AWS Solutions Architect" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuing Organization</label>
                    <input className="form-input" placeholder="e.g. Amazon Web Services" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input className="form-input" type="date" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select">
                      <option>Cloud</option>
                      <option>Programming</option>
                      <option>Design</option>
                      <option>Activity</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button className="btn-red">Upload Certificate</button>
                  <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Certificates list */}
      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">All Certificates ({MOCK_CERTS.length})</div>
        </div>
        <ul className="recent-list">
          {MOCK_CERTS.map((cert, i) => (
            <li key={cert.id} className="recent-item">
              <div>
                <span className="recent-num">{i + 1}.</span>
                <span className="recent-name">{cert.name}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                  {cert.issuer} · {cert.date}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className="badge badge-red">{cert.type}</span>
                <button className="btn-view-pdf">View PDF</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
