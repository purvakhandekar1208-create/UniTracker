import { useState, useEffect, useRef } from "react";
import { getMenteeCerts, uploadCertificate } from "../../api/api";

export default function Certificates({ readOnly = false, data = null }) {
  const [certs,    setCerts]    = useState(data || []);
  const [loading,  setLoading]  = useState(!data);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", provider: "", issue_date: "", type: "Cloud" });
  const fileRef = useRef();

  useEffect(() => {
    if (data) { setCerts(data); return; }
    if (!readOnly) {
      getMenteeCerts()
        .then(setCerts)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [data, readOnly]);

  const handleUpload = async () => {
    if (!form.title || !fileRef.current?.files[0]) {
      alert("Please fill in the title and select a file.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file",      fileRef.current.files[0]);
      fd.append("title",     form.title);
      fd.append("provider",  form.provider);
      fd.append("issueDate", form.issue_date);
      const newCert = await uploadCertificate(fd);
      setCerts((prev) => [newCert, ...prev]);
      setShowForm(false);
      setForm({ title: "", provider: "", issue_date: "", type: "Cloud" });
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="page-sub">Loading certificates...</div>;

  return (
    <div className={readOnly ? "" : "page"}>
      {!readOnly && (
        <>
          <div className="page-heading">Certificates</div>
          <div className="page-sub">Upload and manage your certificates</div>

          <div className="upload-zone" onClick={() => setShowForm(!showForm)}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              Drop certificate here or click to browse
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>PDF, PNG, JPG · Max 5MB</div>
            <button className="btn-red" style={{ marginTop: 14 }}>Browse File</button>
          </div>

          {showForm && (
            <div className="wcard" style={{ marginBottom: 20 }}>
              <div className="wcard-head"><div className="wcard-title">Certificate Details</div></div>
              <div className="wcard-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Certificate Name</label>
                    <input className="form-input" placeholder="e.g. AWS Solutions Architect"
                      value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuing Organization</label>
                    <input className="form-input" placeholder="e.g. Amazon Web Services"
                      value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input className="form-input" type="date"
                      value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certificate File</label>
                    <input type="file" ref={fileRef} accept=".pdf,.png,.jpg,.jpeg" className="form-input" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button className="btn-red" onClick={handleUpload} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Certificate"}
                  </button>
                  <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="wcard">
        <div className="wcard-head">
          <div className="wcard-title">All Certificates ({certs.length})</div>
        </div>
        {certs.length === 0 ? (
          <div className="wcard-body"><div className="page-sub">No certificates uploaded yet.</div></div>
        ) : (
          <ul className="recent-list">
            {certs.map((cert, i) => (
              <li key={cert.id} className="recent-item">
                <div>
                  <span className="recent-num">{i + 1}.</span>
                  <span className="recent-name">{cert.title ?? cert.name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                    {cert.provider ?? cert.issuer} · {cert.issue_date ?? cert.date}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge badge-red">{cert.type ?? "Certificate"}</span>
                  {cert.file_path && (
                    <a href={`http://localhost:8081/api/files/certificates/${cert.id}`}
                       target="_blank" rel="noreferrer" className="btn-view-pdf">
                      View PDF
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
