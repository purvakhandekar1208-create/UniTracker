import { useState, useEffect } from "react";
import { getMenteeProfile, updateMenteeProfile } from "../../api/api";

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

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getMenteeProfile().then(p => {
      setProfile(p);
      setForm({
        phone:        p.phone        || "",
        parent1Phone: p.parent1Phone || p.parent1_phone || "",
        parent2Phone: p.parent2Phone || p.parent2_phone || "",
        parent1Email: p.parent1Email || p.parent1_email || "",
        parent2Email: p.parent2Email || p.parent2_email || "",
        roll:         p.roll         || "",
        division:     p.division     || "",
        batch:        p.batch        || "",
        department:   p.department   || "",
        year:         p.year         ? String(p.year)     : "",
        semester:     p.semester     ? String(p.semester) : "",
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const setF = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = async () => {
    setError(""); setSaved(false); setSaving(true);
    try {
      const updated = await updateMenteeProfile(form);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message || "Failed to save. Please try again.");
    } finally { setSaving(false); }
  };

  const completeness = () => {
    const fields = [
      form.phone, form.parent1Phone, form.parent2Phone,
      form.parent1Email,
      form.department, form.batch, form.year, form.semester, form.roll, form.division
    ];
    const filled = fields.filter(f => f && String(f).trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) return <div className="page"><div className="page-sub">Loading profile...</div></div>;

  const pct = completeness();

  return (
    <div className="page">
      <div className="page-heading">Profile Settings</div>
      <div className="page-sub">Keep your information up to date. Your mentor can view this.</div>

      {/* Completeness bar */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-body">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Profile Completeness</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "#15803d" : "var(--red)" }}>{pct}%</span>
          </div>
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${pct}%`, background: pct === 100 ? "#16a34a" : "var(--red)" }} />
          </div>
          {pct < 100 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
              Complete all fields so your mentor has accurate information about you.
            </div>
          )}
        </div>
      </div>

      {/* Read-only account info */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-head"><div className="wcard-title">Account Info</div></div>
        <div className="wcard-body">
          <div className="form-grid">
            <Field label="Full Name">
              <div className="form-input" style={{ background: "#f3f4f6", color: "var(--muted)", cursor: "not-allowed" }}>{profile?.name}</div>
            </Field>
            <Field label="Email">
              <div className="form-input" style={{ background: "#f3f4f6", color: "var(--muted)", cursor: "not-allowed" }}>{profile?.email}</div>
            </Field>
          </div>
        </div>
      </div>

      {/* Contact info — now includes parent emails */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-head"><div className="wcard-title">📱 Contact Numbers &amp; Emails</div></div>
        <div className="wcard-body">
          <div className="form-grid">
            <Field label="Your Phone Number">
              <input className="form-input" placeholder="e.g. 9876543210"
                value={form.phone} onChange={e => setF("phone", e.target.value)} />
            </Field>
            <Field label="Parent / Guardian 1 Phone">
              <input className="form-input" placeholder="e.g. 9876543210"
                value={form.parent1Phone} onChange={e => setF("parent1Phone", e.target.value)} />
            </Field>
            <Field label="Parent / Guardian 1 Email">
              <input className="form-input" type="email" placeholder="e.g. parent1@email.com"
                value={form.parent1Email} onChange={e => setF("parent1Email", e.target.value)} />
            </Field>
            <Field label="Parent / Guardian 2 Phone">
              <input className="form-input" placeholder="e.g. 9876543210 (optional)"
                value={form.parent2Phone} onChange={e => setF("parent2Phone", e.target.value)} />
            </Field>
            <Field label="Parent / Guardian 2 Email">
              <input className="form-input" type="email" placeholder="e.g. parent2@email.com (optional)"
                value={form.parent2Email} onChange={e => setF("parent2Email", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Academic info */}
      <div className="wcard" style={{ marginBottom: 20 }}>
        <div className="wcard-head"><div className="wcard-title">🎓 Academic Details</div></div>
        <div className="wcard-body">
          <div className="form-group">
            <label className="form-label">Department / Branch</label>
            <select className="form-select" value={form.department} onChange={e => setF("department", e.target.value)}>
              <option value="">-- Select Department --</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-grid">
            <Field label="Batch">
              <input className="form-input" placeholder="e.g. 2022-26"
                value={form.batch} onChange={e => setF("batch", e.target.value)} />
            </Field>
            <Field label="Year">
              <select className="form-select" value={form.year} onChange={e => setF("year", e.target.value)}>
                <option value="">—</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </Field>
            <Field label="Semester">
              <select className="form-select" value={form.semester} onChange={e => setF("semester", e.target.value)}>
                <option value="">—</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </Field>
            <Field label="Roll No">
              <input className="form-input" placeholder="e.g. 45"
                value={form.roll} onChange={e => setF("roll", e.target.value)} />
            </Field>
            <Field label="Division">
              <input className="form-input" placeholder="e.g. A"
                value={form.division} onChange={e => setF("division", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

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
