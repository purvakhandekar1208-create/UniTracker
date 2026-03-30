import { useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/api";

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
    align-items: center; justify-content: center;
    padding: 32px 48px; overflow-y: auto;
  }
  .login-logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .login-shield {
    width: 52px; height: 58px; background: var(--red);
    clip-path: polygon(50% 0%,100% 15%,100% 60%,50% 100%,0% 60%,0% 15%);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #fff;
  }
  .login-college-name .line1 { display: block; font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--red); }
  .login-college-name .line2 { display: block; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; }
  .login-tabs {
    display: flex; margin-bottom: 24px;
    border: 1.5px solid var(--border); border-radius: 8px; overflow: hidden;
    width: 100%; max-width: 360px;
  }
  .login-tab { flex: 1; padding: 10px 0; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer; background: #fafafa; color: var(--muted); transition: all 0.18s; border: none; }
  .login-tab.active { background: var(--red); color: #fff; }
  .login-form { width: 100%; max-width: 360px; }
  .login-label { display: block; font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 5px; }
  .login-input {
    width: 100%; padding: 11px 13px;
    border: 1.5px solid var(--border); border-radius: 6px;
    font-family: var(--font-body); font-size: 14px;
    color: var(--text); background: #fafafa; outline: none;
    transition: border-color 0.2s; margin-bottom: 14px; box-sizing: border-box;
  }
  .login-input:focus { border-color: var(--red); background: #fff; }
  .login-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .login-role-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
  .login-role-btn { padding: 10px 0; border: 1.5px solid var(--border); border-radius: 6px; background: #fafafa; font-family: var(--font-body); font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; text-align: center; transition: all 0.18s; }
  .login-role-btn.active { border-color: var(--red); background: var(--red-lite); color: var(--red); font-weight: 600; }
  .login-btn { width: 100%; padding: 13px; background: var(--red); border: none; border-radius: 6px; color: #fff; font-family: var(--font-body); font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.18s; }
  .login-btn:hover { background: var(--red-dark); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .login-error { background: var(--red-lite); border: 1px solid #f3b8b8; border-radius: 6px; padding: 10px 12px; font-size: 13px; color: var(--red); margin-bottom: 12px; }
  .login-success { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px 12px; font-size: 13px; color: #15803d; margin-bottom: 12px; }
  .login-loading { background: #f0f4ff; border: 1px solid #c7d4f7; border-radius: 6px; padding: 10px 12px; font-size: 13px; color: #3b5bdb; margin-bottom: 12px; text-align: center; }
  .login-links { display: flex; justify-content: center; margin-top: 12px; }
  .login-link { font-size: 13px; color: var(--muted); }
  .login-link span { color: var(--red); text-decoration: underline; cursor: pointer; }
  .login-divider { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; margin-top: 2px; }
`;

export default function Login({ onLogin }) {
  const [tab, setTab] = useState("login");

  // Login state
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("");

  // Register state
  const [reg, setReg] = useState({
    name: "", email: "", password: "", confirm: "",
    role: "", phone: "", roll: "", division: ""
  });

  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetErrors = () => { setError(""); setSuccess(""); };
  const setR = (field, val) => setReg(prev => ({ ...prev, [field]: val }));

  // LOGIN
  const handleLogin = async () => {
    resetErrors();
    if (!email || !password || !role) { setError("Please fill all fields and select your role."); return; }
    setLoading(true);
    try {
      const data = await apiLogin(email, password, role);
      onLogin({ name: data.name, role: data.role, email: data.email, userId: data.userId, roll: data.roll, division: data.division, phone: data.phone });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  // REGISTER
  const handleRegister = async () => {
    resetErrors();
    if (!reg.name || !reg.email || !reg.password || !reg.confirm || !reg.role)
      { setError("Name, email, password and role are required."); return; }
    if (reg.password !== reg.confirm)
      { setError("Passwords do not match."); return; }
    if (reg.password.length < 6)
      { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const data = await apiRegister(reg.name, reg.email, reg.password, reg.role, reg.phone, reg.roll, reg.division);
      onLogin({ name: data.name, role: data.role, email: data.email, userId: data.userId, roll: data.roll, division: data.division, phone: data.phone });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") tab === "login" ? handleLogin() : handleRegister(); };

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
              <span className="line2">University</span>
            </div>
          </div>

          <div className="login-tabs">
            <button className={`login-tab ${tab === "login"    ? "active" : ""}`} onClick={() => { setTab("login");    resetErrors(); }}>Sign In</button>
            <button className={`login-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); resetErrors(); }}>Register</button>
          </div>

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <div className="login-form">
              <label className="login-label">Email</label>
              <input className="login-input" placeholder="you@dypatil.edu or you@gmail.com"
                value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />

              <label className="login-label">Password</label>
              <input className="login-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />

              <label className="login-label" style={{ marginBottom: 8 }}>Sign in as</label>
              <div className="login-role-row">
                <button className={`login-role-btn ${role === "mentor" ? "active" : ""}`} onClick={() => setRole("mentor")} disabled={loading}>👨‍🏫 Mentor</button>
                <button className={`login-role-btn ${role === "mentee" ? "active" : ""}`} onClick={() => setRole("mentee")} disabled={loading}>👩‍🎓 Mentee</button>
              </div>

              {loading && <div className="login-loading">⏳ Signing in...</div>}
              {error   && <div className="login-error">{error}</div>}
              {success && <div className="login-success">{success}</div>}

              <button className="login-btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
              <div className="login-links">
                <span className="login-link">No account? <span onClick={() => { setTab("register"); resetErrors(); }}>Register here</span></span>
              </div>
            </div>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <div className="login-form">

              <label className="login-label">Full Name *</label>
              <input className="login-input" placeholder="e.g. Aarushi Patel"
                value={reg.name} onChange={e => setR("name", e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />

              <label className="login-label">Email *</label>
              <input className="login-input" placeholder="you@dypatil.edu or you@gmail.com"
                value={reg.email} onChange={e => setR("email", e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />

              <div className="login-input-row">
                <div>
                  <label className="login-label">Password *</label>
                  <input className="login-input" type="password" placeholder="Min 6 chars"
                    value={reg.password} onChange={e => setR("password", e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
                </div>
                <div>
                  <label className="login-label">Confirm Password *</label>
                  <input className="login-input" type="password" placeholder="Re-enter"
                    value={reg.confirm} onChange={e => setR("confirm", e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
                </div>
              </div>

              <div className="login-divider">Optional Details</div>

              <div className="login-input-row">
                <div>
                  <label className="login-label">Roll No</label>
                  <input className="login-input" placeholder="e.g. 45"
                    value={reg.roll} onChange={e => setR("roll", e.target.value)} disabled={loading} />
                </div>
                <div>
                  <label className="login-label">Division</label>
                  <input className="login-input" placeholder="e.g. A or B"
                    value={reg.division} onChange={e => setR("division", e.target.value)} disabled={loading} />
                </div>
              </div>

              <label className="login-label">Phone Number</label>
              <input className="login-input" placeholder="e.g. 9876543210"
                value={reg.phone} onChange={e => setR("phone", e.target.value)} disabled={loading} />

              <label className="login-label" style={{ marginBottom: 8 }}>Register as *</label>
              <div className="login-role-row">
                <button className={`login-role-btn ${reg.role === "mentor" ? "active" : ""}`} onClick={() => setR("role","mentor")} disabled={loading}>👨‍🏫 Mentor</button>
                <button className={`login-role-btn ${reg.role === "mentee" ? "active" : ""}`} onClick={() => setR("role","mentee")} disabled={loading}>👩‍🎓 Mentee</button>
              </div>

              {loading && <div className="login-loading">⏳ Creating account...</div>}
              {error   && <div className="login-error">{error}</div>}
              {success && <div className="login-success">{success}</div>}

              <button className="login-btn" onClick={handleRegister} disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
              </button>
              <div className="login-links">
                <span className="login-link">Already have an account? <span onClick={() => { setTab("login"); resetErrors(); }}>Sign in</span></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
