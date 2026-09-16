import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSession } from "../../../hooks/useSession";
import styles from "./style.module.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useSession();
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <NavLink className={styles.brand} to="/">EO Portal</NavLink>
        <nav className={styles.nav} aria-label="주 메뉴">
          {isAdmin ? <NavLink to="/admin">배포 관리</NavLink> : null}
          <NavLink to="/company">{isAdmin ? "보낸 EO" : "받은 EO"}</NavLink>
        </nav>
        <div className={styles.account}>
          <span><strong>{user?.displayName}</strong> · {user?.email}</span>
          <button type="button" className="button" onClick={handleLogout} disabled={isLoggingOut}>로그아웃</button>
        </div>
      </header>
      <main className={styles.main}><Outlet /></main>
    </div>
  );
}
