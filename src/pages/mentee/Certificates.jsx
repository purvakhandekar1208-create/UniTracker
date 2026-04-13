// import { useState, useEffect, useRef } from "react";
// import { getMenteeCerts, uploadCertificate } from "../../api/api";

// export default function Certificates({ readOnly = false, data = null }) {
//   const [certs,    setCerts]    = useState(data || []);
//   const [loading,  setLoading]  = useState(!data);
//   const [showForm, setShowForm] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [form, setForm] = useState({ title: "", provider: "", issue_date: "", type: "Cloud" });
//   const fileRef = useRef();

//   useEffect(() => {
//     if (data) { setCerts(data); return; }
//     if (!readOnly) {
//       getMenteeCerts()
//         .then(setCerts)
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }
//   }, [data, readOnly]);

//   const handleUpload = async () => {
//     if (!form.title || !fileRef.current?.files[0]) {
//       alert("Please fill in the title and select a file.");
//       return;
//     }
//     setUploading(true);
//     try {
//       const fd = new FormData();
//       fd.append("file",      fileRef.current.files[0]);
//       fd.append("title",     form.title);
//       fd.append("provider",  form.provider);
//       fd.append("issueDate", form.issue_date);
//       const newCert = await uploadCertificate(fd);
//       setCerts((prev) => [newCert, ...prev]);
//       setShowForm(false);
//       setForm({ title: "", provider: "", issue_date: "", type: "Cloud" });
//     } catch (e) {
//       alert("Upload failed: " + e.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading) return <div className="page-sub">Loading certificates...</div>;

//   return (
//     <div className={readOnly ? "" : "page"}>
//       {!readOnly && (
//         <>
//           <div className="page-heading">Certificates</div>
//           <div className="page-sub">Upload and manage your certificates</div>

//           <div className="upload-zone" onClick={() => setShowForm(!showForm)}>
//             <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
//             <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
//               Drop certificate here or click to browse
//             </div>
//             <div style={{ fontSize: 13, color: "var(--muted)" }}>PDF, PNG, JPG · Max 5MB</div>
//             <button className="btn-red" style={{ marginTop: 14 }}>Browse File</button>
//           </div>

//           {showForm && (
//             <div className="wcard" style={{ marginBottom: 20 }}>
//               <div className="wcard-head"><div className="wcard-title">Certificate Details</div></div>
//               <div className="wcard-body">
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label className="form-label">Certificate Name</label>
//                     <input className="form-input" placeholder="e.g. AWS Solutions Architect"
//                       value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Issuing Organization</label>
//                     <input className="form-input" placeholder="e.g. Amazon Web Services"
//                       value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Issue Date</label>
//                     <input className="form-input" type="date"
//                       value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Certificate File</label>
//                     <input type="file" ref={fileRef} accept=".pdf,.png,.jpg,.jpeg" className="form-input" />
//                   </div>
//                 </div>
//                 <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
//                   <button className="btn-red" onClick={handleUpload} disabled={uploading}>
//                     {uploading ? "Uploading..." : "Upload Certificate"}
//                   </button>
//                   <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       <div className="wcard">
//         <div className="wcard-head">
//           <div className="wcard-title">All Certificates ({certs.length})</div>
//         </div>
//         {certs.length === 0 ? (
//           <div className="wcard-body"><div className="page-sub">No certificates uploaded yet.</div></div>
//         ) : (
//           <ul className="recent-list">
//             {certs.map((cert, i) => (
//               <li key={cert.id} className="recent-item">
//                 <div>
//                   <span className="recent-num">{i + 1}.</span>
//                   <span className="recent-name">{cert.title ?? cert.name}</span>
//                   <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
//                     {cert.provider ?? cert.issuer} · {cert.issue_date ?? cert.date}
//                   </span>
//                 </div>
//                 <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                   <span className="badge badge-red">{cert.type ?? "Certificate"}</span>
//                   {cert.file_path && (
//                     <a href={`http://localhost:8081/api/files/certificates/${cert.id}`}
//                        target="_blank" rel="noreferrer" className="btn-view-pdf">
//                       View PDF
//                     </a>
//                   )}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect, useRef } from "react";
// import { getMenteeCerts, uploadCertificate } from "../../api/api";

// const BASE_URL = "http://localhost:8081";

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const providerColor = (p = "") => {
//   const map = {
//     amazon: "#FF9900", google: "#4285F4", microsoft: "#0078D4",
//     coursera: "#0056D2", udemy: "#A435F0", nptel: "#E85D04",
//     infosys: "#007CC3", tcs: "#C00", cisco: "#1BA0D7",
//   };
//   const key = Object.keys(map).find(k => p.toLowerCase().includes(k));
//   return key ? map[key] : "#7C1C1C";
// };

// const initials = (title = "") =>
//   title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

// // ── Upload Modal ──────────────────────────────────────────────────────────────
// function UploadModal({ onClose, onUploaded }) {
//   const [file,      setFile]      = useState(null);
//   const [title,     setTitle]     = useState("");
//   const [provider,  setProvider]  = useState("");
//   const [issueDate, setIssueDate] = useState("");
//   const [drag,      setDrag]      = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error,     setError]     = useState("");
//   const inputRef = useRef();

//   const handleFile = (f) => {
//     if (!f) return;
//     const ok = ["application/pdf", "image/png", "image/jpeg"].includes(f.type);
//     if (!ok) { setError("Only PDF, PNG or JPG files are allowed."); return; }
//     if (f.size > 5 * 1024 * 1024) { setError("File must be under 5 MB."); return; }
//     setFile(f);
//     setError("");
//     // Auto-fill title from filename
//     if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
//   };

//   const handleDrop = (e) => {
//     e.preventDefault(); setDrag(false);
//     handleFile(e.dataTransfer.files[0]);
//   };

//   const handleSubmit = async () => {
//     if (!file)    { setError("Please select a file."); return; }
//     if (!title)   { setError("Certificate title is required."); return; }
//     if (!provider){ setError("Provider / Issuer is required."); return; }
//     setUploading(true); setError("");
//     try {
//       const fd = new FormData();
//       fd.append("file",       file);
//       fd.append("title",      title);
//       fd.append("provider",   provider);
//       fd.append("issue_date", issueDate);
//       const cert = await uploadCertificate(fd);
//       onUploaded(cert);
//       onClose();
//     } catch (e) {
//       setError(e.message || "Upload failed. Please try again.");
//     } finally { setUploading(false); }
//   };

//   return (
//     <div style={{
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//       zIndex: 1000, padding: 20
//     }} onClick={e => e.target === e.currentTarget && onClose()}>
//       <div style={{
//         background: "#fff", borderRadius: 12, width: "100%", maxWidth: 480,
//         boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden"
//       }}>
//         {/* Header */}
//         <div style={{ background: "var(--red)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div>
//             <div style={{ color: "#fff", fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>Upload Certificate</div>
//             <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>PDF, PNG or JPG · Max 5 MB</div>
//           </div>
//           <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, color: "#fff", width: 32, height: 32, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
//         </div>

//         <div style={{ padding: 24 }}>
//           {/* Drop zone */}
//           <div
//             onDragOver={e => { e.preventDefault(); setDrag(true); }}
//             onDragLeave={() => setDrag(false)}
//             onDrop={handleDrop}
//             onClick={() => inputRef.current.click()}
//             style={{
//               border: `2px dashed ${drag ? "var(--red)" : file ? "#16a34a" : "var(--border)"}`,
//               borderRadius: 8, padding: "28px 20px", textAlign: "center",
//               cursor: "pointer", marginBottom: 18, transition: "all 0.2s",
//               background: drag ? "var(--red-lite)" : file ? "#f0fdf4" : "#fafafa"
//             }}
//           >
//             <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
//               style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
//             <div style={{ fontSize: 32, marginBottom: 8 }}>{file ? "✅" : "📄"}</div>
//             {file ? (
//               <>
//                 <div style={{ fontWeight: 600, fontSize: 14, color: "#15803d" }}>{file.name}</div>
//                 <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
//                   {(file.size / 1024).toFixed(0)} KB · Click to change
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div style={{ fontWeight: 600, fontSize: 14 }}>Drag & drop or click to browse</div>
//                 <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>PDF, PNG, JPG accepted</div>
//               </>
//             )}
//           </div>

//           {/* Fields */}
//           <div style={{ marginBottom: 12 }}>
//             <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text)" }}>
//               Certificate Title *
//             </label>
//             <input className="form-input" placeholder="e.g. AWS Cloud Practitioner"
//               value={title} onChange={e => setTitle(e.target.value)} />
//           </div>

//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
//             <div>
//               <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text)" }}>
//                 Issuer / Provider *
//               </label>
//               <input className="form-input" placeholder="e.g. Amazon, Google, Coursera"
//                 value={provider} onChange={e => setProvider(e.target.value)} />
//             </div>
//             <div>
//               <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text)" }}>
//                 Issue Date
//               </label>
//               <input className="form-input" type="date"
//                 value={issueDate} onChange={e => setIssueDate(e.target.value)} />
//             </div>
//           </div>

//           {error && (
//             <div style={{ background: "var(--red-lite)", border: "1px solid #f3b8b8", borderRadius: 6, padding: "9px 12px", fontSize: 12, color: "var(--red)", marginBottom: 12 }}>
//               ⚠️ {error}
//             </div>
//           )}

//           <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
//             <button onClick={onClose} style={{ flex: 1, padding: "11px", border: "1.5px solid var(--border)", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
//               Cancel
//             </button>
//             <button onClick={handleSubmit} disabled={uploading} className="btn-red" style={{ flex: 2, fontSize: 13 }}>
//               {uploading ? "Uploading..." : "Upload Certificate"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── PDF Viewer Modal ──────────────────────────────────────────────────────────
// function PdfViewer({ cert, onClose }) {
//   const url = `${BASE_URL}/api/files/certificates/${cert.id}`;
//   const isPdf = (cert.file_path || "").toLowerCase().endsWith(".pdf");

//   return (
//     <div style={{
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
//       display: "flex", flexDirection: "column", zIndex: 1000
//     }}>
//       {/* Toolbar */}
//       <div style={{ background: "#1a1a1a", padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #333" }}>
//         <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, color: "#fff", padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>
//           ← Back
//         </button>
//         <div style={{ flex: 1 }}>
//           <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{cert.title}</div>
//           <div style={{ color: "#aaa", fontSize: 11 }}>{cert.provider} · {cert.issue_date || "—"}</div>
//         </div>
//         <a href={url} download target="_blank" rel="noreferrer"
//           style={{ background: "var(--red)", color: "#fff", padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
//           ⬇ Download
//         </a>
//       </div>

//       {/* Viewer */}
//       <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
//         {isPdf ? (
//           <iframe
//             src={`${url}#toolbar=1&navpanes=0`}
//             style={{ width: "100%", height: "100%", border: "none" }}
//             title={cert.title}
//           />
//         ) : (
//           <img src={url} alt={cert.title}
//             style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 4 }} />
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Certificate Card ──────────────────────────────────────────────────────────
// function CertCard({ cert, onClick }) {
//   const color = providerColor(cert.provider);
//   const ext   = (cert.file_path || "").split(".").pop().toLowerCase();
//   const isPdf = ext === "pdf";

//   return (
//     <div onClick={onClick} style={{
//       background: "#fff", border: "1.5px solid var(--border)", borderRadius: 10,
//       overflow: "hidden", cursor: "pointer", transition: "all 0.18s",
//       boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
//     }}
//       onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
//       onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
//     >
//       {/* Color header with initials */}
//       <div style={{ background: color, padding: "22px 20px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80 }}>
//         <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "var(--font-head)" }}>
//           {initials(cert.title)}
//         </div>
//       </div>

//       {/* Info */}
//       <div style={{ padding: "14px 16px" }}>
//         <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3, color: "var(--text)" }}>
//           {cert.title}
//         </div>
//         <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
//           {cert.provider}{cert.issue_date ? ` · ${cert.issue_date}` : ""}
//         </div>

//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <span style={{
//             fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
//             background: isPdf ? "#fef2f2" : "#eff6ff",
//             color: isPdf ? "#dc2626" : "#2563eb",
//             textTransform: "uppercase", letterSpacing: "0.06em"
//           }}>
//             {isPdf ? "📄 PDF" : "🖼 Image"}
//           </span>
//           <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>View →</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Certificates Page ────────────────────────────────────────────────────
// export default function Certificates({ readOnly = false, data = null }) {
//   const [certs,      setCerts]      = useState(data || []);
//   const [loading,    setLoading]    = useState(!data);
//   const [showUpload, setShowUpload] = useState(false);
//   const [viewing,    setViewing]    = useState(null);   // cert being viewed

//   useEffect(() => {
//     if (data) { setCerts(data); return; }
//     if (!readOnly) {
//       getMenteeCerts()
//         .then(setCerts)
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }
//   }, [data, readOnly]);

//   const handleUploaded = (newCert) => setCerts(prev => [newCert, ...prev]);

//   if (loading) return <div className="page-sub" style={{ padding: 20 }}>Loading certificates...</div>;

//   // ── Viewer mode (full screen) ─────────────────────────────────────────────
//   if (viewing) {
//     return <PdfViewer cert={viewing} onClose={() => setViewing(null)} />;
//   }

//   return (
//     <div className={readOnly ? "" : "page"}>
//       {/* Upload Modal */}
//       {showUpload && (
//         <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
//       )}

//       {!readOnly && (
//         <>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
//             <div>
//               <div className="page-heading">Certificates</div>
//               <div className="page-sub">Upload and manage your achievement certificates</div>
//             </div>
//             <button className="btn-red" onClick={() => setShowUpload(true)} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
//               + Upload Certificate
//             </button>
//           </div>

//           {/* Stats */}
//           <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
//             {[
//               { label: "Total", value: certs.length },
//               { label: "PDFs",  value: certs.filter(c => (c.file_path||"").endsWith(".pdf")).length },
//               { label: "Images",value: certs.filter(c => !["pdf"].includes((c.file_path||"").split(".").pop())).length },
//             ].map(({ label, value }) => (
//               <div key={label} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 8, padding: "10px 20px", textAlign: "center", minWidth: 80 }}>
//                 <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, color: "var(--red)" }}>{value}</div>
//                 <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {/* Grid */}
//       {certs.length === 0 ? (
//         <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted)" }}>
//           <div style={{ fontSize: 48, marginBottom: 12 }}>🎖️</div>
//           <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>No certificates yet</div>
//           {!readOnly && (
//             <div style={{ fontSize: 13 }}>
//               Click <strong>"+ Upload Certificate"</strong> to add your first one.
//             </div>
//           )}
//         </div>
//       ) : (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
//           {certs.map(cert => (
//             <CertCard key={cert.id} cert={cert} onClick={() => setViewing(cert)} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react";
import { getMenteeCerts, uploadCertificate, getToken } from "../../api/api";

const BASE_URL = "http://localhost:8081";

// ── Fetch file with JWT → blob URL (solves auth + content-type issues) ────────
async function fetchFileAsBlob(certId) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/files/certificates/${certId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), type: blob.type };
}

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

  const handleFile = (f) => {
    if (!f) return;
    const ok = ["application/pdf", "image/png", "image/jpeg"].includes(f.type);
    if (!ok) { setError("Only PDF, PNG or JPG files are allowed."); return; }
    if (f.size > 5 * 1024 * 1024) { setError("File must be under 5 MB."); return; }
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
      const fd = new FormData();
      fd.append("file",       file);
      fd.append("title",      title);
      fd.append("provider",   provider);
      fd.append("issue_date", issueDate);
      const cert = await uploadCertificate(fd);
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
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>

        <div style={{ background: "var(--red)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#fff", fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>Upload Certificate</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>PDF, PNG or JPG · Max 5 MB</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, color: "#fff", width: 32, height: 32, fontSize: 18, cursor: "pointer" }}>×</button>
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
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Drag & drop or click to browse</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>PDF, PNG, JPG accepted</div>
              </>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Certificate Title *</label>
            <input className="form-input" placeholder="e.g. AWS Cloud Practitioner" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Issuer / Provider *</label>
              <input className="form-input" placeholder="e.g. Amazon, Google" value={provider} onChange={e => setProvider(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Issue Date</label>
              <input className="form-input" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
          </div>

          {error && (
            <div style={{ background: "var(--red-lite)", border: "1px solid #f3b8b8", borderRadius: 6, padding: "9px 12px", fontSize: 12, color: "var(--red)", marginBottom: 12 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 11, border: "1.5px solid var(--border)", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={uploading} className="btn-red" style={{ flex: 2, fontSize: 13 }}>
              {uploading ? "Uploading..." : "Upload Certificate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PDF / Image Viewer (blob-based — no auth issues) ─────────────────────────
function FileViewer({ cert, onClose }) {
  const [blobUrl,  setBlobUrl]  = useState(null);
  const [mimeType, setMimeType] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    let objectUrl = null;
    fetchFileAsBlob(cert.id)
      .then(({ url, type }) => {
        objectUrl = url;
        setBlobUrl(url);
        setMimeType(type);
      })
      .catch(e => setError(e.message || "Could not load file. Is the backend running?"))
      .finally(() => setLoading(false));

    // Cleanup blob URL on unmount to free memory
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [cert.id]);

  const isPdf = mimeType === "application/pdf" || (cert.file_path || "").toLowerCase().endsWith(".pdf");

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = cert.title + (isPdf ? ".pdf" : ".jpg");
    a.click();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", zIndex: 1000 }}>

      {/* Toolbar */}
      <div style={{ background: "#1a1a1a", padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #333", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6, color: "#fff", padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{cert.title}</div>
          <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{cert.provider}{cert.issue_date ? ` · ${cert.issue_date}` : ""}</div>
        </div>
        {blobUrl && (
          <button onClick={handleDownload} style={{ background: "var(--red)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            ⬇ Download
          </button>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {loading && (
          <div style={{ color: "#fff", fontSize: 15, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            Loading file...
          </div>
        )}

        {error && (
          <div style={{ color: "#f87171", fontSize: 14, textAlign: "center", maxWidth: 360 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Could not load file</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{error}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: "#aaa" }}>
              Make sure the backend is running on port 8081.
            </div>
          </div>
        )}

        {blobUrl && !error && (
          isPdf ? (
            <iframe
              src={blobUrl}
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 4 }}
              title={cert.title}
            />
          ) : (
            <img
              src={blobUrl}
              alt={cert.title}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 6, boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}
            />
          )
        )}
      </div>
    </div>
  );
}

// ── Certificate Card ──────────────────────────────────────────────────────────
function CertCard({ cert, onClick }) {
  const color = providerColor(cert.provider);
  const ext   = (cert.file_path || "").split(".").pop().toLowerCase();
  const isPdf = ext === "pdf";

  return (
    <div onClick={onClick}
      style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
    >
      <div style={{ background: color, padding: "22px 20px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "var(--font-head)" }}>
          {initials(cert.title)}
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{cert.title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
          {cert.provider}{cert.issue_date ? ` · ${cert.issue_date}` : ""}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
            background: isPdf ? "#fef2f2" : "#eff6ff",
            color: isPdf ? "#dc2626" : "#2563eb",
            textTransform: "uppercase", letterSpacing: "0.06em"
          }}>
            {isPdf ? "📄 PDF" : "🖼 Image"}
          </span>
          <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>View →</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Certificates Page ────────────────────────────────────────────────────
export default function Certificates({ readOnly = false, data = null }) {
  const [certs,      setCerts]      = useState(data || []);
  const [loading,    setLoading]    = useState(!data);
  const [showUpload, setShowUpload] = useState(false);
  const [viewing,    setViewing]    = useState(null);

  useEffect(() => {
    if (data) { setCerts(data); return; }
    if (!readOnly) {
      getMenteeCerts()
        .then(setCerts)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [data, readOnly]);

  const handleUploaded = (newCert) => setCerts(prev => [newCert, ...prev]);

  if (loading) return <div className="page-sub" style={{ padding: 20 }}>Loading certificates...</div>;

  // Full-screen viewer takes over entire screen
  if (viewing) {
    return <FileViewer cert={viewing} onClose={() => setViewing(null)} />;
  }

  return (
    <div className={readOnly ? "" : "page"}>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}

      {!readOnly && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div className="page-heading">Certificates</div>
              <div className="page-sub">Upload and manage your achievement certificates</div>
            </div>
            <button className="btn-red" onClick={() => setShowUpload(true)} style={{ marginTop: 4 }}>
              + Upload Certificate
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total",  value: certs.length },
              { label: "PDFs",   value: certs.filter(c => (c.file_path || "").endsWith(".pdf")).length },
              { label: "Images", value: certs.filter(c => !["pdf"].includes((c.file_path || "").split(".").pop())).length },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 8, padding: "10px 20px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, color: "var(--red)" }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {certs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎖️</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>No certificates yet</div>
          {!readOnly && <div style={{ fontSize: 13 }}>Click <strong>"+ Upload Certificate"</strong> to add your first one.</div>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {certs.map(cert => (
            <CertCard key={cert.id} cert={cert} onClick={() => setViewing(cert)} />
          ))}
        </div>
      )}
    </div>
  );
}


