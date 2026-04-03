import { useState, useEffect } from "react";
import "./index.css";

// Components
import Sidebar from "./pages/components/Sidebar";
import Navbar  from "./pages/components/Navbar";

// Auth
import Login from "./pages/Login";

// Mentee pages
import MenteeDashboard  from "./pages/mentee/Dashboard";
import Marks            from "./pages/mentee/Marks";
import Certificates     from "./pages/mentee/Certificates";
import Courses          from "./pages/mentee/Courses";
import Attendance       from "./pages/mentee/Attendance";
import ProfileSettings  from "./pages/mentee/ProfileSettings";

// Mentor pages
import MentorDashboard from "./pages/mentor/Dashboard";
import MenteesList     from "./pages/mentor/MenteesList";
import MenteeDetail    from "./pages/mentor/MenteeDetail";

import { getAllMentees, addRemark, getMenteeRemarksById, getUser } from "./api/api";
import { Avatar } from "./assets/Icons";

// ─── Mentee Academics wrapper ─────────────────────────────────────────────────
function Academics() {
  const [tab, setTab] = useState("marks");
  return (
    <div className="page">
      <div className="page-heading">Academics</div>
      <div className="page-sub">Your marks, courses and attendance</div>
      <div className="tabs-bar">
        {["marks", "courses", "attendance"].map((t) => (
          <div key={t} className={`tab-item ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
      {tab === "marks"      && <Marks      readOnly />}
      {tab === "courses"    && <Courses    readOnly />}
      {tab === "attendance" && <Attendance readOnly />}
    </div>
  );
}

// ─── Mentor My Batches ────────────────────────────────────────────────────────
function MyBatches({ onNavigate }) {
  const BATCHES = [
    { id: 1, name: "B.Tech - Computer Engineering", div: "A", batch: 1, students: 25 },
    { id: 2, name: "B.Tech - Computer Engineering", div: "B", batch: 2, students: 22 },
  ];
  return (
    <div className="page">
      <div className="page-heading">Welcome back! Here are your assigned batches for this semester.</div>
      <div style={{ marginBottom: 28 }} />
      <div className="batch-grid">
        {BATCHES.map((b) => (
          <div className="batch-card" key={b.id}>
            <div className="batch-dot" />
            <div className="batch-name">{b.name}</div>
            <div className="batch-meta">Division: {b.div} | Batch: {b.batch}</div>
            <div className="batch-meta">Total Students: {b.students}</div>
            <button className="batch-btn" onClick={() => onNavigate("mentees")}>VIEW ALL STUDENTS →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mentor Remarks ───────────────────────────────────────────────────────────
function Remarks() {
  const [mentees,  setMentees]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [text,     setText]     = useState("");
  const [remarks,  setRemarks]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [posting,  setPosting]  = useState(false);

  useEffect(() => {
    getAllMentees()
      .then((data) => { setMentees(data); if (data.length > 0) setSelected(data[0]); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    getMenteeRemarksById(selected.id).then(setRemarks).catch(console.error);
  }, [selected]);

  const handlePost = async () => {
    if (!text.trim() || !selected) return;
    setPosting(true);
    try {
      const r = await addRemark(selected.id, text);
      setRemarks((prev) => [r, ...prev]);
      setText("");
    } catch (e) { alert("Failed: " + e.message); }
    finally { setPosting(false); }
  };

  if (loading) return <div className="page"><div className="page-sub">Loading...</div></div>;

  return (
    <div className="page">
      <div className="page-heading">Remarks & Feedback</div>
      <div className="page-sub">Leave feedback for your mentees</div>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        <div className="wcard" style={{ height: "fit-content" }}>
          <div className="wcard-head"><div className="wcard-title" style={{ fontSize: 13 }}>Mentees</div></div>
          <div style={{ padding: 8 }}>
            {mentees.map((m) => (
              <div key={m.id} onClick={() => setSelected(m)} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "10px",
                borderRadius: 6, cursor: "pointer", marginBottom: 2,
                background: selected?.id === m.id ? "var(--red-soft)" : "transparent",
              }}>
                <Avatar name={m.name} size={26} />
                <div style={{ fontSize: 13, color: selected?.id === m.id ? "var(--red)" : "var(--text)", fontWeight: selected?.id === m.id ? 600 : 400 }}>
                  {m.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="wcard" style={{ marginBottom: 16 }}>
            <div className="wcard-head"><div className="wcard-title">Add Remark for {selected?.name}</div></div>
            <div className="wcard-body">
              <div className="form-group">
                <textarea className="form-input" rows={4} style={{ resize: "vertical" }}
                  placeholder="Write your observation or feedback..."
                  value={text} onChange={(e) => setText(e.target.value)} />
              </div>
              <button className="btn-red" onClick={handlePost} disabled={posting}>
                {posting ? "Posting..." : "Post Remark"}
              </button>
            </div>
          </div>
          <div className="wcard">
            <div className="wcard-head"><div className="wcard-title">Previous Remarks</div></div>
            <div className="wcard-body">
              {remarks.length === 0 ? <div className="page-sub">No remarks yet.</div> :
                remarks.map((r) => (
                  <div className="remark-card" key={r.id}>
                    <div className="remark-meta">{r.mentor_name} · {r.remark_date}</div>
                    <div className="remark-text">{r.message}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard:       "Dashboard",
  mentees:         "All Mentees",
  batches:         "My Batches",
  resources:       "Resources",
  remarks:         "Remarks",
  profile:         "Profile",
  academics:       "Academics",
  certificates:    "Certificates",
  profilesettings: "Profile Settings",
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,           setUser]           = useState(null);
  const [activePage,     setActivePage]     = useState("dashboard");
  const [selectedMentee, setSelectedMentee] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const saved = getUser();
    if (saved?.token || saved?.userId) setUser(saved);
  }, []);

  const getTitle = () => {
    if (!user) return "";
    if (user.role === "mentee" && activePage === "dashboard")
      return `Hello, ${user.name}${user.roll ? ` (Roll: ${user.roll})` : ""}`;
    if (activePage === "mentee-detail" && selectedMentee) return selectedMentee.name;
    return PAGE_TITLES[activePage] || "UniTracker";
  };

  const navigate = (page) => {
    setActivePage(page);
    if (page !== "mentee-detail") setSelectedMentee(null);
  };

  const viewMentee = (mentee) => {
    setSelectedMentee(mentee);
    setActivePage("mentee-detail");
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    import("./api/api").then(({ logout }) => logout());
    setUser(null);
    setActivePage("dashboard");
  };

  const renderPage = () => {
    if (user.role === "mentor") {
      switch (activePage) {
        case "dashboard":
          return <MentorDashboard onViewMentee={viewMentee} />;
        case "mentees":
          return <MenteesList onViewMentee={viewMentee} />;
        case "batches":
          return <MyBatches onNavigate={navigate} />;
        case "remarks":
          return <Remarks />;
        case "mentee-detail":
          return selectedMentee
            ? <MenteeDetail mentee={selectedMentee} onBack={() => navigate("mentees")} />
            : null;
        case "resources":
          return <div className="page"><div className="page-heading">Resources</div><div className="page-sub">Shared study materials will appear here.</div></div>;
        case "profile":
          return <div className="page"><div className="page-heading">Profile</div><div className="page-sub">Faculty profile page — coming soon.</div></div>;
        default: return null;
      }
    }

    // Mentee pages
    switch (activePage) {
      case "dashboard":
        return <MenteeDashboard user={user} onNavigate={navigate} />;
      case "academics":
        return <Academics />;
      case "certificates":
        return (
          <div className="page">
            <div className="page-heading">Certificates</div>
            <div className="page-sub">Your uploaded certificates</div>
            <Certificates />
          </div>
        );
      case "profilesettings":
        return <ProfileSettings />;
      default: return null;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        role={user.role}
        activePage={activePage}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Navbar user={user} title={getTitle()} />
        {renderPage()}
      </div>
    </div>
  );
}
