import { useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/api";

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

const styles = `
  .login-page { display: flex; height: 100vh; overflow: hidden; }
  .login-left {
    flex: 0 0 58%;
    background: url('/images/RAIT_image.png') center / cover no-repeat;
    position: relative;
  }
  .login-left::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to right, rgba(90,19,19,0.35), rgba(0,0,0,0.1));
  }
  .login-right {
    flex: 1; background: var(--white);
    display: flex; flex-direction: column;
    align-items: center; justify-content: flex-start;
    padding: 28px 48px; overflow-y: auto; min-height: 100vh;
  }
  .login-logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; margin-top: 8px; }
  .login-shield {
    width: 48px; height: 54px; background: var(--red);
    clip-path: polygon(50% 0%,100% 15%,100% 60%,50% 100%,0% 60%,0% 15%);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: #fff;
  }
  .login-college-name .line1 { display: block; font-family: var(--font-head); font-size: 19px; font-weight: 800; color: var(--red); }
  .login-college-name .line2 { display: block; font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; }
  .login-tabs {
    display: flex; margin-bottom: 20px;
    border: 1.5px solid var(--border); border-radius: 8px; overflow: hidden;
    width: 100%; max-width: 380px;
  }
  .login-tab { flex: 1; padding: 10px 0; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer; background: #fafafa; color: var(--muted); transition: all 0.18s; border: none; }
  .login-tab.active { background: var(--red); color: #fff; }
  .login-form { width: 100%; max-width: 380px; }
  .login-label { display: block; font-size: 12px; font-weight: 500; color: var(--text); margin-bottom: 4px; }
  .login-input, .login-select {
    width: 100%; padding: 10px 12px;
    border: 1.5px solid var(--border); border-radius: 6px;
    font-family: var(--font-body); font-size: 13px;
    color: var(--text); background: #fafafa; outline: none;
    transition: border-color 0.2s; margin-bottom: 12px; box-sizing: border-box;
  }
  .login-input:focus, .login-select:focus { border-color: var(--red); background: #fff; }
  .login-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .login-input-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .login-role-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .login-role-btn { padding: 9px 0; border: 1.5px solid var(--border); border-radius: 6px; background: #fafafa; font-family: var(--font-body); font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; text-align: center; transition: all 0.18s; }
  .login-role-btn.active { border-color: var(--red); background: var(--red-lite); color: var(--red); font-weight: 600; }
  .login-btn { width: 100%; padding: 12px; background: var(--red); border: none; border-radius: 6px; color: #fff; font-family: var(--font-body); font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.18s; margin-top: 2px; }
  .login-btn:hover { background: var(--red-dark); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .login-error   { background: var(--red-lite); border: 1px solid #f3b8b8; border-radius: 6px; padding: 9px 12px; font-size: 12px; color: var(--red); margin-bottom: 10px; }
  .login-loading { background: #f0f4ff; border: 1px solid #c7d4f7; border-radius: 6px; padding: 9px 12px; font-size: 12px; color: #3b5bdb; margin-bottom: 10px; text-align: center; }
  .login-links { display: flex; justify-content: center; margin-top: 10px; }
  .login-link { font-size: 12px; color: var(--muted); }
  .login-link span { color: var(--red); text-decoration: underline; cursor: pointer; }
  .login-section-title {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted);
    margin: 10px 0 8px; padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
  }
  .mentor-note {
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;
    padding: 8px 12px; font-size: 11px; color: #92400e; margin-bottom: 10px;
  }
`;

export default function Login({ onLogin }) {
  const [tab, setTab] = useState("login");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("");

  const [reg, setReg] = useState({
    name: "", email: "", password: "", confirm: "", role: "",
    phone: "", roll: "", division: "", batch: "",
    department: "", year: "", semester: "",
  });

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => setError("");
  const setR  = (f, v) => setReg(p => ({ ...p, [f]: v }));

  const handleLogin = async () => {
    reset();
    if (!email || !password || !role) { setError("Please fill all fields and select your role."); return; }
    setLoading(true);
    try {
      const d = await apiLogin(email, password, role);
      onLogin(d);
    } catch (e) { setError(e.message || "Login failed."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    reset();
    if (!reg.name || !reg.email || !reg.password || !reg.confirm || !reg.role)
      { setError("Name, email, password and role are required."); return; }
    if (reg.password !== reg.confirm) { setError("Passwords do not match."); return; }
    if (reg.password.length < 6)     { setError("Password must be at least 6 characters."); return; }
    if (reg.role === "mentee" && !reg.department) { setError("Please select your department."); return; }
    setLoading(true);
    try {
      const d = await apiRegister(reg);
      onLogin(d);
    } catch (e) { setError(e.message || "Registration failed."); }
    finally { setLoading(false); }
  };

  const kd = (e) => { if (e.key === "Enter") tab === "login" ? handleLogin() : handleRegister(); };

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-left" />
        <div className="login-right">

          <div className="login-logo-row">
            <div className="login-shield">🎓</div>
            <div className="login-college-name">
              <span className="line1">DY PATIL</span>
              <span className="line2">University · UniTracker</span>
            </div>
          </div>

          <div className="login-tabs">
            <button className={`login-tab ${tab === "login"    ? "active" : ""}`} onClick={() => { setTab("login");    reset(); }}>Sign In</button>
            <button className={`login-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); reset(); }}>Register</button>
          </div>

          {/* ── SIGN IN ── */}
          {tab === "login" && (
            <div className="login-form">
              <label className="login-label">Email</label>
              <input className="login-input" placeholder="you@dypatil.edu"
                value={email} onChange={e => setEmail(e.target.value)} onKeyDown={kd} disabled={loading} />

              <label className="login-label">Password</label>
              <input className="login-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={kd} disabled={loading} />

              <label className="login-label" style={{ marginBottom: 7 }}>Sign in as</label>
              <div className="login-role-row">
                <button className={`login-role-btn ${role === "mentor" ? "active" : ""}`} onClick={() => setRole("mentor")} disabled={loading}>👨‍🏫 Mentor</button>
                <button className={`login-role-btn ${role === "mentee" ? "active" : ""}`} onClick={() => setRole("mentee")} disabled={loading}>👩‍🎓 Mentee</button>
              </div>

              {loading && <div className="login-loading">⏳ Signing in...</div>}
              {error   && <div className="login-error">{error}</div>}

              <button className="login-btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
              <div className="login-links">
                <span className="login-link">No account? <span onClick={() => { setTab("register"); reset(); }}>Register here</span></span>
              </div>
            </div>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <div className="login-form">

              {/* Role selector first */}
              <label className="login-label" style={{ marginBottom: 7 }}>I am a *</label>
              <div className="login-role-row">
                <button className={`login-role-btn ${reg.role === "mentor" ? "active" : ""}`} onClick={() => setR("role","mentor")} disabled={loading}>👨‍🏫 Mentor</button>
                <button className={`login-role-btn ${reg.role === "mentee" ? "active" : ""}`} onClick={() => setR("role","mentee")} disabled={loading}>👩‍🎓 Mentee</button>
              </div>

              {/* Basic info */}
              <div className="login-section-title">Account Details</div>

              <label className="login-label">Full Name *</label>
              <input className="login-input" placeholder="e.g. Aarushi Patel"
                value={reg.name} onChange={e => setR("name", e.target.value)} onKeyDown={kd} disabled={loading} />

              <label className="login-label">Email *</label>
              <input className="login-input" placeholder="you@dypatil.edu"
                value={reg.email} onChange={e => setR("email", e.target.value)} onKeyDown={kd} disabled={loading} />

              <div className="login-input-row">
                <div>
                  <label className="login-label">Password *</label>
                  <input className="login-input" type="password" placeholder="Min 6 chars"
                    value={reg.password} onChange={e => setR("password", e.target.value)} onKeyDown={kd} disabled={loading} />
                </div>
                <div>
                  <label className="login-label">Confirm Password *</label>
                  <input className="login-input" type="password" placeholder="Re-enter"
                    value={reg.confirm} onChange={e => setR("confirm", e.target.value)} onKeyDown={kd} disabled={loading} />
                </div>
              </div>

              {/* Mentee-only academic details */}
              {reg.role === "mentee" && (
                <>
                  <div className="login-section-title">Academic Details</div>

                  <label className="login-label">Department / Branch *</label>
                  <select className="login-select" value={reg.department} onChange={e => setR("department", e.target.value)} disabled={loading}>
                    <option value="">-- Select Department --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  <div className="login-input-row3">
                    <div>
                      <label className="login-label">Roll No</label>
                      <input className="login-input" placeholder="e.g. 24CE1000"
                        value={reg.roll} onChange={e => setR("roll", e.target.value)} disabled={loading} />
                    </div>
                    <div>
                      <label className="login-label">Year</label>
                      <select className="login-select" value={reg.year} onChange={e => setR("year", e.target.value)} disabled={loading}>
                        <option value="">—</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="login-label">Semester</label>
                      <select className="login-select" value={reg.semester} onChange={e => setR("semester", e.target.value)} disabled={loading}>
                        <option value="">—</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="login-input-row">
                    
                    <div>
                      <label className="login-label">Division</label>
                      <input className="login-input" placeholder="e.g. A"
                        value={reg.division} onChange={e => setR("division", e.target.value)} disabled={loading} />
                    </div>
                    <div>
                      <label className="login-label">Batch</label>
                      <input className="login-input" placeholder="e.g. A1 or A2"
                        value={reg.batch} onChange={e => setR("batch", e.target.value)} disabled={loading} required/>
                    </div>
                    
                  </div>

                  <label className="login-label">Your Phone Number</label>
                  <input className="login-input" placeholder="e.g. 9876543210"
                    value={reg.phone} onChange={e => setR("phone", e.target.value)} disabled={loading} />
                </>
              )}

              {/* Mentor-only: just phone */}
              {reg.role === "mentor" && (
                <>
                  <div className="login-section-title">Contact</div>
                  <label className="login-label">Phone Number</label>
                  <input className="login-input" placeholder="e.g. 9876543210"
                    value={reg.phone} onChange={e => setR("phone", e.target.value)} disabled={loading} />
                  <div className="mentor-note">
                    ℹ️ As a mentor, you will be assigned to student batches by the admin after registration.
                  </div>
                </>
              )}

              {loading && <div className="login-loading">⏳ Creating account...</div>}
              {error   && <div className="login-error">{error}</div>}

              <button className="login-btn" onClick={handleRegister} disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
              </button>
              <div className="login-links">
                <span className="login-link">Already have an account? <span onClick={() => { setTab("login"); reset(); }}>Sign in</span></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
