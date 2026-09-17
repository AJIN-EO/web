import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import RequiredMark from "../../components/RequiredMark";
import { useLoginForm } from "../../hooks/useLoginForm";
import { errorMessage } from "../../utils/format";
import styles from "./style.module.css";

export default function LoginPage() {
  const form = useLoginForm();

  if (form.isLoading) return <div className="page-state">세션 확인 중...</div>;
  if (form.redirectTo) return <Navigate to={form.redirectTo} replace />;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div>
          <span className={styles.eyebrow}>EO Portal</span>
          <h1>로그인</h1>
          <p>메일로 받은 EO를 확인하거나 배포를 관리하려면 로그인하세요.</p>
        </div>
        <label><span>이메일<RequiredMark /></span><input type="email" value={form.email} onChange={(event) => form.setEmail(event.target.value)} autoComplete="username" required /></label>
        <label><span>비밀번호<RequiredMark /></span><input type="password" value={form.password} onChange={(event) => form.setPassword(event.target.value)} autoComplete="current-password" required /></label>
        {form.error ? <p className="alert alert--error" role="alert">{errorMessage(form.error)}</p> : null}
        <button className="button button--primary" type="submit" disabled={form.isSubmitting}>{form.isSubmitting ? "로그인 중..." : "로그인"}</button>
      </form>
    </main>
  );
}
