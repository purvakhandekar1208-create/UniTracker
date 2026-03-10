import { useState } from "react";

const styles = `
  .login-page {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .login-left {
    flex: 0 0 58%;
    background: url('https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80') center / cover no-repeat;
    position: relative;
  }

  .login-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(90, 19, 19, 0.35), rgba(0, 0, 0, 0.1));
  }

  .login-right {
    flex: 1;
    background: var(--white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 56px;
  }

  .login-logo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 36px;
  }

  .login-shield {
    width: 52px;
    height: 58px;
    background: var(--red);
    clip-path: polygon(50% 0%, 100% 15%, 100% 60%, 50% 100%, 0% 60%, 0% 15%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #fff;
  }

  .login-college-name .line1 {
    display: block;
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: 800;
    color: var(--red);
  }

  .login-college-name .line2 {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .login-title {
    font-family: var(--font-head);
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 32px;
    text-align: center;
  }

  .login-form {
    width: 100%;
    max-width: 340px;
  }

  .login-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 6px;
  }

  .login-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--border);
    border-radius: 6px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
    background: #fafafa;
    outline: none;
    transition: border-color 0.2s;
    margin-bottom: 18px;
  }

  .login-input:focus {
    border-color: var(--red);
    background: #fff;
  }

  .login-role-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 24px;
  }

  .login-role-btn {
    padding: 11px 0;
    border: 1.5px solid var(--border);
    border-radius: 6px;
    background: #fafafa;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    text-align: center;
    transition: all 0.18s;
  }

  .login-role-btn.active {
    border-color: var(--red);
    background: var(--red-lite);
    color: var(--red);
    font-weight: 600;
  }

  .login-btn {
    width: 100%;
    padding: 13px;
    background: var(--red);
    border: none;
    border-radius: 6px;
    color: #fff;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.18s;
  }

  .login-btn:hover { background: var(--red-dark); }

  .login-links {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }

  .login-link {
    font-size: 13px;
    color: var(--text);
    text-decoration: underline;
    cursor: pointer;
  }

  .login-error {
    background: var(--red-lite);
    border: 1px solid #f3b8b8;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 13px;
    color: var(--red);
    margin-bottom: 16px;
  }
`;

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [role, setRole]             = useState("");
  const [error, setError]           = useState("");

  const handleSubmit = () => {
    if (!identifier || !password || !role) {
      setError("Please fill all fields and select your role.");
      return;
    }
    // Email domain validation
    if (identifier.includes("@") && !identifier.endsWith("@dypatil.edu")) {
      setError("Only @dypatil.edu email addresses are allowed.");
      return;
    }
    // TODO: Replace with real API call → POST /api/auth/login
    const mockUser =
      role === "mentor"
        ? { name: "Dr. Meera Iyer", role: "mentor", email: identifier }
        : { name: "Aisha Patil", role: "mentee", email: identifier, roll: "45", div: "B" };

    onLogin(mockUser);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        {/* Left — campus image */}
        <div className="login-left" />

        {/* Right — form */}
        <div className="login-right">
          <div className="login-logo-row">
            <div className="login-shield">🎓</div>
            <div className="login-college-name">
              <span className="line1">DY PATIL</span>
              <span className="line2">University</span>
            </div>
          </div>

          <div className="login-title">Welcome to UniTracker</div>

          <div className="login-form">
            <label className="login-label">Email / PRN No.</label>
            <input
              className="login-input"
              placeholder="yourname@dypatil.edu or PRN"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label className="login-label" style={{ marginBottom: 8 }}>
              Sign in as
            </label>
            <div className="login-role-row">
              <button
                className={`login-role-btn ${role === "mentor" ? "active" : ""}`}
                onClick={() => setRole("mentor")}
              >
                👨‍🏫 Mentor
              </button>
              <button
                className={`login-role-btn ${role === "mentee" ? "active" : ""}`}
                onClick={() => setRole("mentee")}
              >
                👩‍🎓 Mentee
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="login-btn" onClick={handleSubmit}>
              Sign In
            </button>

            <div className="login-links">
              <span className="login-link">Forgot Password?</span>
              <span className="login-link">Request Access</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
