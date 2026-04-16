import { useState, useEffect, useRef } from "react";
import { getMenteeCerts, getMenteeCertById, uploadCertificateBase64, deleteCertificate } from "../../api/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const providerColor = (p = "") => {
  const map = {
    amazon: "#FF9900", google: "#4285F4", microsoft: "#0078D4",
    coursera: "#0056D2", udemy: "#A435F0", nptel: "#E85D04",
    infosys: "#007CC3", tcs: "#C00", cisco: "#1BA0D7",
  };
  const key = Object.keys(map).find(k => p.toLowerCase().includes(k));
  return key ? map[key] : "#7C1C1C";
};

const initials = (title = "") =>
  title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

// Build a data: URL for inline viewing — works for both new (file_data) and legacy (file_path) certs
function getDataUrl(cert) {
  if (cert.file_data && cert.file_type) {
    return `data:${cert.file_type};base64,${cert.file_data}`;
  }
  return null;
}

function isPdf(cert) {
  if (cert.file_type) return cert.file_type === "application/pdf";
  return (cert.file_path || "").toLowerCase().endsWith(".pdf");
}


// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploaded }) {
  const [file,      setFile]      = useState(null);
  const [title,     setTitle]     = useState("");
  const [provider,  setProvider]  = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [drag,      setDrag]      = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const inputRef = useRef();

  const LIMIT_MB = 5;

  const handleFile = (f) => {
    if (!f) return;
    const ok = ["application/pdf", "image/png", "image/jpeg"].includes(f.type);
    if (!ok) { setError("Only PDF, PNG or JPG files are allowed."); return; }
    if (f.size > LIMIT_MB * 1024 * 1024) { setError(`File must be under ${LIMIT_MB} MB.`); return; }
    setFile(f); setError("");
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
  };

  const handleDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };

  const handleSubmit = async () => {
    if (!file)     { setError("Please select a file."); return; }
    if (!title)    { setError("Certificate title is required."); return; }
    if (!provider) { setError("Provider / Issuer is required."); return; }
    setUploading(true); setError("");
    try {
      // File → Base64 → JSON → DB (no disk storage)
      const cert = await uploadCertificateBase64(title, provider, issueDate, file);
      onUploaded(cert);
      onClose();
    } catch (e) {
      setError(e.message || "Upload failed. Please try again.");
    } finally { setUploading(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 480,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "var(--red)", padding: "18px 24px", display: "flex",
                      justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#fff", fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>
              Upload Certificate
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
              PDF, PNG or JPG · Max {LIMIT_MB} MB · Stored securely in database
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6,
                     color: "#fff", width: 32, height: 32, fontSize: 18, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            style={{
              border: `2px dashed ${drag ? "var(--red)" : file ? "#16a34a" : "var(--border)"}`,
              borderRadius: 8, padding: "28px 20px", textAlign: "center",
              cursor: "pointer", marginBottom: 18, transition: "all 0.2s",
              background: drag ? "var(--red-lite)" : file ? "#f0fdf4" : "#fafafa"
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
              style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize: 32, marginBottom: 8 }}>{file ? "✅" : "📄"}</div>
            {file ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#15803d" }}>{file.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Drag &amp; drop or click to browse</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>PDF, PNG, JPG accepted</div>
              </>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
              Certificate Title *
            </label>
            <input className="form-input" placeholder="e.g. AWS Cloud Practitioner"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Issuer / Provider *
              </label>
              <input className="form-input" placeholder="e.g. Google, NPTEL"
                value={provider} onChange={e => setProvider(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Issue Date
              </label>
              <input className="form-input" type="date"
                value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
          </div>

          {error && (
            <div style={{ background: "var(--red-lite)", border: "1px solid #f3b8b8",
                          borderRadius: 6, padding: "9px 12px", fontSize: 12,
                          color: "var(--red)", margin: "12px 0" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: 11, border: "1.5px solid var(--border)",
                       borderRadius: 6, background: "#fff", cursor: "pointer",
                       fontSize: 13, fontWeight: 600 }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={uploading} className="btn-red"
              style={{ flex: 2, fontSize: 13 }}>
              {uploading ? "Saving to database…" : "Upload Certificate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Inline Viewer ──────────────────────────────────────────────
// Fetches file_data on open (not included in list responses to keep them fast)
function FileViewer({ cert, onClose }) {
  const [fullCert, setFullCert] = useState(
    cert.file_data ? cert : null   // already have data (freshly uploaded)
  );
  const [loading, setLoading] = useState(!cert.file_data);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (cert.file_data) return;   // skip fetch if already available
    getMenteeCertById(cert.id)
      .then(data => setFullCert(data))
      .catch(e  => setError(e.message || "Could not load certificate file"))
      .finally(() => setLoading(false));
  }, [cert.id, cert.file_data]);

  const dataUrl = fullCert?.file_data && fullCert?.file_type
    ? `data:${fullCert.file_type};base64,${fullCert.file_data}`
    : null;
  const pdf = fullCert ? isPdf(fullCert) : false;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
                  display: "flex", flexDirection: "column", zIndex: 1000 }}>

      {/* Toolbar */}
      <div style={{ background: "#1a1a1a", padding: "12px 20px", display: "flex",
                    alignItems: "center", gap: 16, borderBottom: "1px solid #333", flexShrink: 0 }}>
        <button onClick={onClose}
          style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6,
                   color: "#fff", padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{cert.title}</div>
          <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>
            {cert.provider}{cert.issue_date ? ` · ${cert.issue_date}` : ""}
          </div>
        </div>
      </div>

      {/* Viewer area */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex",
                    alignItems: "center", justifyContent: "center", padding: 20 }}>

        {loading && (
          <div style={{ color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <div>Loading certificate…</div>
          </div>
        )}

        {error && (
          <div style={{ color: "#f87171", textAlign: "center", maxWidth: 360 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Could not load file</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{error}</div>
          </div>
        )}

        {dataUrl && !error && (
          pdf ? (
            <iframe
              src={dataUrl}
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 4 }}
              title={cert.title}
            />
          ) : (
            <img
              src={dataUrl}
              alt={cert.title}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                       borderRadius: 6, boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}
            />
          )
        )}
      </div>
    </div>
  );
}


// ── Certificate Card ──────────────────────────────────────────────
function CertCard({ cert, onClick, onDelete, readOnly }) {
  const color = providerColor(cert.provider);
  const pdf   = isPdf(cert);
  const hasData = !!(cert.file_data || cert.file_path);

  const handleDelete = (e) => {
    e.stopPropagation();   // don’t open the viewer
    onDelete(cert);
  };

  return (
    <div
      style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 10,
               overflow: "hidden", cursor: "pointer", transition: "all 0.18s",
               boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
    >
      {/* Delete button — top-right corner, mentee only */}
      {!readOnly && (
        <button
          onClick={handleDelete}
          title="Delete certificate"
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 2,
            background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
            width: 28, height: 28, color: "#fff", fontSize: 14,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
        >
          🗑️
        </button>
      )}

      {/* Card body — clicking opens viewer */}
      <div onClick={onClick}>
        {/* Color header */}
        <div style={{ background: color, padding: "22px 20px", display: "flex",
                      alignItems: "center", justifyContent: "center", minHeight: 80 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "var(--font-head)" }}>
            {initials(cert.title)}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>
            {cert.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            {cert.provider}{cert.issue_date ? ` · ${cert.issue_date}` : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
              background: pdf ? "#fef2f2" : "#eff6ff",
              color: pdf ? "#dc2626" : "#2563eb",
              textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              {pdf ? "📄 PDF" : "🖼️ Image"}
            </span>
            <span style={{ fontSize: 12, color: hasData ? "var(--red)" : "var(--muted)", fontWeight: 600 }}>
              {hasData ? "View →" : "No file"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Confirm Delete Modal ──────────────────────────────────────────
function ConfirmDelete({ cert, onConfirm, onCancel, deleting }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1100, padding: 20
    }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background: "#fff", borderRadius: 12, maxWidth: 380, width: "100%",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 12, textAlign: "center" }}>🗑️</div>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700,
                      textAlign: "center", marginBottom: 8 }}>Delete Certificate?</div>
        <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", marginBottom: 24 }}>
          <strong>{cert.title}</strong> will be permanently deleted and cannot be recovered.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: "10px", border: "1.5px solid var(--border)",
                     borderRadius: 6, background: "#fff", cursor: "pointer",
                     fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ flex: 1, padding: "10px", border: "none",
                     borderRadius: 6, background: "#dc2626", color: "#fff",
                     cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Main Certificates Component (mentee + mentor read-only) ───────────────────
export default function Certificates({ readOnly = false, data = null, viewCertId = null }) {
  const [certs,      setCerts]      = useState(data || []);
  const [loading,    setLoading]    = useState(!data);
  const [showUpload, setShowUpload] = useState(false);
  const [viewing,    setViewing]    = useState(null);
  const [toDelete,   setToDelete]   = useState(null);   // cert awaiting confirmation
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    if (data) {
      setCerts(data);
      setLoading(false);
      return;
    }
    if (!readOnly) {
      getMenteeCerts()
        .then(setCerts)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [data, readOnly]);

  // Auto-view logic if an ID is passed from outside
  useEffect(() => {
    if (viewCertId && certs.length > 0) {
      const target = certs.find(c => String(c.id) === String(viewCertId));
      if (target) setViewing(target);
    }
  }, [viewCertId, certs]);

  const handleUploaded = (newCert) => setCerts(prev => [newCert, ...prev]);

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCertificate(toDelete.id);
      setCerts(prev => prev.filter(c => c.id !== toDelete.id));
      // If we were viewing this cert, close it
      if (viewing?.id === toDelete.id) setViewing(null);
      setToDelete(null);
    } catch (e) {
      alert("Failed to delete: " + e.message);
    } finally { setDeleting(false); }
  };

  if (loading) return <div className="page-sub" style={{ padding: 20 }}>Loading certificates...</div>;

  // Full-screen viewer
  if (viewing) {
    return <FileViewer cert={viewing} onClose={() => setViewing(null)} />;
  }

  const total  = certs.length;
  const pdfs   = certs.filter(c => isPdf(c)).length;
  const images = total - pdfs;

  return (
    <div className={readOnly ? "" : "page"}>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}

      {/* Confirm delete dialog */}
      {toDelete && (
        <ConfirmDelete
          cert={toDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
          deleting={deleting}
        />
      )}

      {/* Header + upload button (mentee only) */}
      {!readOnly && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between",
                        alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div className="page-heading">Certificates</div>
              <div className="page-sub">Upload and manage your achievement certificates</div>
            </div>
            <button className="btn-red" onClick={() => setShowUpload(true)} style={{ marginTop: 4 }}>
              + Upload Certificate
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total",  value: total  },
              { label: "PDFs",   value: pdfs   },
              { label: "Images", value: images },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", border: "1.5px solid var(--border)",
                                        borderRadius: 8, padding: "10px 20px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, color: "var(--red)" }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {certs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎖️</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>No certificates yet</div>
          {!readOnly && (
            <div style={{ fontSize: 13 }}>
              Click <strong>"+ Upload Certificate"</strong> to add your first one.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {certs.map(cert => (
            <CertCard
              key={cert.id}
              cert={cert}
              readOnly={readOnly}
              onClick={() => setViewing(cert)}
              onDelete={c => setToDelete(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
