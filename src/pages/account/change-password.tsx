import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { changePassword } from "../../api/auth";
import { useSession } from "../../hooks/useSession";
import { useRetryCooldown } from "../../hooks/useRetryCooldown";
import { accountErrorMessage, landingPath, passwordValidation, safeNextPath } from "../../utils/account";
import styles from "../login/style.module.css";

export default function ChangePasswordPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState<unknown>(null);
  const cooldown = useRetryCooldown();
  const required = session.user?.mustChangePassword;
  const destination = safeNextPath(params.get("next")) ?? landingPath(session.user?.role ?? "company");
  const validation = passwordValidation(currentPassword, newPassword, confirmation);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (validation || inFlight.current || cooldown.seconds) return;
    inFlight.current = true; setPending(true); setError(null);
    try {
      const { user } = await changePassword({ currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmation("");
      await session.replaceSession(user);
      navigate(destination, { replace: true });
    } catch (failure) { setError(failure); cooldown.record(failure); }
    finally { inFlight.current = false; setPending(false); }
  };
  const logout = async () => {
    try { await session.logout(); } finally { navigate(`/login?next=${encodeURIComponent(destination)}`, { replace: true }); }
  };

  return <main className={styles.page}>
    <form className={styles.card} onSubmit={submit}>
      <div><span className={styles.eyebrow}>EO Portal</span><h1>{required ? "개인 비밀번호 설정" : "비밀번호 변경"}</h1>
        <p>{required ? "메일로 받은 임시 비밀번호를 개인 비밀번호로 바꾼 후 EO 자료를 확인할 수 있습니다." : "본인 계정의 비밀번호를 변경합니다. 다른 기기의 기존 로그인은 해제됩니다."}</p></div>
      <p className={styles.email}>{session.user?.email}</p>
      <label>현재 비밀번호<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} maxLength={256} disabled={pending} required /></label>
      <label>새 비밀번호<input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={12} maxLength={256} disabled={pending} required aria-describedby="password-help" /></label>
      <p id="password-help">12~256자, 현재 비밀번호와 다른 값으로 입력하세요. 기본 비밀번호 패턴은 사용할 수 없습니다.</p>
      <label>새 비밀번호 확인<input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={12} maxLength={256} disabled={pending} required /></label>
      {confirmation && validation ? <p className="alert alert--error" role="alert">{validation}</p> : null}
      {error ? <p className="alert alert--error" role="alert">{accountErrorMessage(error)}</p> : null}
      {cooldown.seconds > 0 ? <p role="status">{cooldown.seconds}초 후 다시 시도할 수 있습니다.</p> : null}
      <button className="button button--primary" disabled={Boolean(validation) || pending || cooldown.seconds > 0}>{pending ? "비밀번호 변경 중..." : required ? "설정하고 계속하기" : "비밀번호 변경"}</button>
      {!required && !pending ? <Link className="button" to={destination}>취소</Link> : null}
      <button className="button" type="button" disabled={pending || session.isLoggingOut} onClick={() => void logout()}>로그아웃</button>
    </form>
  </main>;
}
