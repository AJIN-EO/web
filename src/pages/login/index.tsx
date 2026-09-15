import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { errorMessage } from "../../utils/format";
import styles from "./style.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, login, isLoggingIn, loginError } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const requestedPath = searchParams.get("next");
  const safeNext = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
    ? requestedPath
    : null;

  if (isLoading) return <div className="page-state">세션 확인 중...</div>;
  if (user) return <Navigate to={safeNext ?? landingPath(user.role)} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const loggedInUser = await login({ email: email.trim(), password });
    const next = safeNext ?? landingPath(loggedInUser.user.role);
    navigate(next, { replace: true });
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div>
          <span className={styles.eyebrow}>EO Portal</span>
          <h1>로그인</h1>
          <p>메일로 받은 EO를 확인하거나 배포를 관리하려면 로그인하세요.</p>
        </div>
        <label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label>
        <label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
        {loginError ? <p className="alert alert--error" role="alert">{errorMessage(loginError)}</p> : null}
        <button className="button button--primary" type="submit" disabled={isLoggingIn}>{isLoggingIn ? "로그인 중..." : "로그인"}</button>
      </form>
    </main>
  );
}

function landingPath(role: string) {
  return role === "admin" || role === "staff" ? "/admin" : "/company";
}
