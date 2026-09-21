import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { passwordChangePath } from "../../../utils/account";
import { useSession } from "../../../hooks/useSession";
import styles from "./style.module.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoggingOut } = useSession();
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try { await logout(); } finally { navigate("/login", { replace: true }); }
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <NavLink className={styles.brand} to="/">EO Portal</NavLink>
        <nav className={styles.nav} aria-label="주 메뉴">
          {isAdmin ? <><NavLink to="/admin" end>배포 관리</NavLink><NavLink to="/admin/vehicles">차종 설정</NavLink></> : null}
          <NavLink to={isAdmin ? "/admin/requests" : "/company"}>{isAdmin ? "보낸 EO" : "받은 EO"}</NavLink>
        </nav>
        <div className={styles.account}>
          <span><strong>{user?.displayName}</strong> · {user?.email}</span>
          <NavLink to={passwordChangePath(`${location.pathname}${location.search}${location.hash}`)}>비밀번호 변경</NavLink>
          {!isAdmin ? <NavLink to="/account/email">이메일 변경</NavLink> : null}
          <button type="button" className="button" onClick={handleLogout} disabled={isLoggingOut}>로그아웃</button>
        </div>
      </header>
      <main className={styles.main}><Outlet /></main>
    </div>
  );
}
