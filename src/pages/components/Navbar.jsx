import { Avatar } from "../../assets/Icons";

const styles = `
  .navbar {
    position: fixed;
    top: 0;
    left: var(--sidebar-w);
    right: 0;
    height: 60px;
    background: var(--white);
    border-bottom: 2px solid var(--red);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    z-index: 9;
  }

  .navbar-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
  }

  .navbar-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .navbar-username {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }
`;

export default function Navbar({ user, title }) {
  return (
    <>
      <style>{styles}</style>
      <div className="navbar">
        <div className="navbar-title">{title}</div>
        <div className="navbar-user">
          <span className="navbar-username">{user.name}</span>
          <Avatar name={user.name} size={34} />
        </div>
      </div>
    </>
  );
}
