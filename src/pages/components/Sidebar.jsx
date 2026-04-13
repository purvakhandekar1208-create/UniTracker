import { Icons } from "../../assets/Icons";

const styles = `
  .sidebar {
    width: var(--sidebar-w);
    background: var(--white);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    z-index: 10;
  }

  .sidebar-logo {
    padding: 22px 20px 18px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sidebar-shield {
    width: 36px; height: 40px;
    background: var(--red);
    clip-path: polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: #fff; flex-shrink: 0;
  }

  .sidebar-brand {
    font-family: var(--font-head);
    font-size: 15px; font-weight: 800; color: var(--red); line-height: 1.2;
  }

  .sidebar-brand small {
    display: block; font-family: var(--font-body);
    font-size: 10px; font-weight: 500; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  .sidebar-nav {
    flex: 1; padding: 16px 12px; overflow-y: auto;
  }

  .sidebar-section-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--muted);
    padding: 10px 14px 4px; margin-top: 4px;
  }

  .sidebar-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: 6px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: var(--muted);
    transition: all 0.15s; margin-bottom: 2px;
  }

  .sidebar-item:hover  { background: var(--red-soft); color: var(--red); }
  .sidebar-item.active { background: var(--red); color: #fff; }

  .sidebar-item svg { width: 17px; height: 17px; flex-shrink: 0; }

  .sidebar-footer {
    padding: 14px 12px;
    border-top: 1px solid var(--border);
  }

  .sidebar-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 6px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: var(--muted);
    transition: all 0.15s;
  }

  .sidebar-logout:hover { background: var(--red-soft); color: var(--red); }
  .sidebar-logout svg { width: 17px; height: 17px; }
`;

const MENTOR_NAV = [
  { id: "dashboard", label: "Dashboard",  Icon: Icons.Home     },
  { id: "mentees",   label: "Mentees",    Icon: Icons.Users    },
  { id: "batches",   label: "My Batches", Icon: Icons.Calendar },
  { id: "remarks",   label: "Remarks",    Icon: Icons.Chat     },
  { id: "profile",   label: "Profile",    Icon: Icons.User     },
];

const MENTEE_NAV = [
  {
    section: "Main",
    items: [
      { id: "dashboard",    label: "Home",         Icon: Icons.Home  },
      { id: "academics",    label: "Academics",    Icon: Icons.Book  },
      { id: "certificates", label: "Certificates", Icon: Icons.Award },
    ]
  },
  {
    section: "Account",
    items: [
      { id: "profilesettings", label: "Profile Settings", Icon: Icons.User },
    ]
  }
];

export default function Sidebar({ role, activePage, onNavigate, onLogout }) {
  const isMentee = role === "mentee";

  return (
    <>
      <style>{styles}</style>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-shield">🎓</div>
          <div className="sidebar-brand">
            DY Patil
            <small>UniTracker Portal</small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {isMentee ? (
            // Mentee nav — grouped with section labels
            MENTEE_NAV.map(({ section, items }) => (
              <div key={section}>
                <div className="sidebar-section-label">{section}</div>
                {items.map(({ id, label, Icon }) => (
                  <div
                    key={id}
                    className={`sidebar-item ${activePage === id ? "active" : ""}`}
                    onClick={() => onNavigate(id)}
                  >
                    <Icon />
                    {label}
                  </div>
                ))}
              </div>
            ))
          ) : (
            // Mentor nav — flat list
            MENTOR_NAV.map(({ id, label, Icon }) => (
              <div
                key={id}
                className={`sidebar-item ${activePage === id ? "active" : ""}`}
                onClick={() => onNavigate(id)}
              >
                <Icon />
                {label}
              </div>
            ))
          )}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-logout" onClick={onLogout}>
            <Icons.Logout />
            Logout
          </div>
        </div>
      </aside>
    </>
  );
}
