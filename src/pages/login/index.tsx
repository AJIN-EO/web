import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import RequiredMark from "../../components/RequiredMark";
import { useLoginForm } from "../../hooks/useLoginForm";
import { accountErrorMessage } from "../../utils/account";
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
        {form.notice ? <p className="alert alert--info" role="status">{form.notice}</p> : null}
        <p>처음 이용하는 기업 계정은 첫 EO 안내 메일의 임시 비밀번호로 로그인한 후 개인 비밀번호를 설정하세요.</p>
        <label><span>이메일<RequiredMark /></span><input type="email" value={form.email} onChange={(event) => form.setEmail(event.target.value)} autoComplete="username" required /></label>
        <label><span>비밀번호<RequiredMark /></span><input type="password" value={form.password} onChange={(event) => form.setPassword(event.target.value)} autoComplete="current-password" required /></label>
        {form.error ? <p className="alert alert--error" role="alert">{accountErrorMessage(form.error)}</p> : null}
        {form.retrySeconds > 0 ? <p role="status">{form.retrySeconds}초 후 다시 시도할 수 있습니다.</p> : null}
        <button className="button button--primary" type="submit" disabled={form.isSubmitting || form.retrySeconds > 0}>{form.isSubmitting ? "로그인 중..." : "로그인"}</button>
      </form>
    </main>
  );
}
