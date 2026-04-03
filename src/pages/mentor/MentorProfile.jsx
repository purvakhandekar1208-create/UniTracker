import { useEffect, useState } from "react";
import { getUser } from "../../api/api";
import { Avatar } from "../../assets/Icons";

const DEPARTMENTS = [
  "Computer Engineering (Core)",
  "Information Technology (IT)",
  "Computer Science and Engineering",
  "Artificial Intelligence and Data Science",
  "Computer Science and Business Systems",
  "Cybersecurity",
  "Electronics and Computer Engineering",
  "Electronics and Telecommunication Engineering",
  "Electrical and Instrumentation Engineering",
  "Nano Science and Technology",
];

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function MentorProfile({ myBatches = [] }) {
  const [mentor,  setMentor]  = useState(null);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const user = getUser();
    if (user) {
      setMentor(user);
      setForm({
        phone:      user.phone      || "",
        department: user.department || "",
      });
    }
  }, []);

  const setF = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = async () => {
    setError(""); setSaved(false); setSaving(true);
    try {
      const updated = { ...mentor, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setMentor(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!mentor)
    return (
      <div className="page">
        <div className="page-sub">Loading profile...</div>
      </div>
    );

  return (
    <div className="page">
      <div className="page-heading">Mentor Profile</div>
      <div className="page-sub">Keep your information up to date.</div>

      {/* ── Account Info (read-only) ── */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-head"><div className="wcard-title">Account Info</div></div>
        <div className="wcard-body">

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <Avatar name={mentor.name} size={54} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{mentor.name}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{mentor.email}</div>
            </div>
          </div>

          <div className="form-grid">
            <Field label="Full Name">
              <div className="form-input" style={{ background: "#f3f4f6", color: "var(--muted)", cursor: "not-allowed" }}>
                {mentor.name}
              </div>
            </Field>
            <Field label="Email">
              <div className="form-input" style={{ background: "#f3f4f6", color: "var(--muted)", cursor: "not-allowed" }}>
                {mentor.email}
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ── Contact Info ── */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-head"><div className="wcard-title">📱 Contact Number</div></div>
        <div className="wcard-body">
          <div className="form-grid">
            <Field label="Your Phone Number">
              <input
                className="form-input"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={e => setF("phone", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Academic Details ── */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-head"><div className="wcard-title">🎓 Academic Details</div></div>
        <div className="wcard-body">
          <div className="form-group">
            <label className="form-label">Department / Branch</label>
            <select
              className="form-select"
              value={form.department}
              onChange={e => setF("department", e.target.value)}
            >
              <option value="">-- Select Department --</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Assigned Batches (read-only) ── */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-head"><div className="wcard-title">📋 Assigned Batches</div></div>
        <div className="wcard-body">
          {myBatches.length === 0 ? (
            <div className="page-sub">No batches assigned yet.</div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {myBatches.map((b) => (
                <span key={b.id} className="badge badge-red">
                  {b.full}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Feedback messages ── */}
      {error && (
        <div style={{ background: "var(--red-lite)", border: "1px solid #f3b8b8", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 16 }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#15803d", marginBottom: 16 }}>
          ✅ Profile updated successfully!
        </div>
      )}

      <button className="btn-red" onClick={handleSave} disabled={saving} style={{ minWidth: 160, fontSize: 14 }}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}