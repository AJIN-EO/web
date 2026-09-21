import type { FormEvent } from "react";
import PageHeader from "../../components/PageHeader";
import { useSession } from "../../hooks/useSession";
import { useEmailChange } from "../../hooks/useEmailChange";
import { accountErrorMessage } from "../../utils/account";
import { formatDateTime } from "../../utils/format";
import styles from "./style.module.css";

export default function EmailChangePage() {
  const { user } = useSession();
  const form = useEmailChange();
  const submit = (action: () => Promise<void>) => (event: FormEvent) => { event.preventDefault(); void action(); };
  return <div className={styles.page}>
    <PageHeader title="이메일 변경" description="새 주소를 인증하면 로그인 이메일과 EO 수신 주소가 함께 바뀝니다." />
    <section className="panel">
      <h2>현재 이메일</h2><p className={styles.email}>{user?.email}</p>
      <p>인증을 완료하기 전까지 기존 주소를 사용합니다. 소속 기업과 기존 EO·의견은 유지됩니다.</p>
    </section>
    {form.error || form.query.error ? <p className="alert alert--error" role="alert">{accountErrorMessage(form.error ?? form.query.error)}</p> : null}
    {form.notice ? <p className="alert alert--success" role="status">{form.notice}</p> : null}
    {form.retrySeconds > 0 ? <p role="status">인증 요청 제한: {form.retrySeconds}초 후 다시 시도할 수 있습니다.</p> : null}
    <section className="panel">
      <div className={styles.header}><h2>1. 새 주소로 인증코드 받기</h2><button type="button" className="button" disabled={form.busy} onClick={() => void form.query.refetch()}>요청 상태 확인</button></div>
      {form.query.isPending ? <p>진행 중인 인증 요청을 확인하는 중...</p> : null}
      <form className={styles.form} onSubmit={submit(form.request)}>
        <label>새 이메일<input type="email" autoComplete="email" value={form.newEmail} onChange={(event) => form.setNewEmail(event.target.value)} maxLength={254} disabled={form.busy} required /></label>
        <label>현재 비밀번호<input type="password" autoComplete="current-password" value={form.currentPassword} onChange={(event) => form.setCurrentPassword(event.target.value)} maxLength={256} disabled={form.busy} required /></label>
        <p>코드는 15분간 유효하며 재발급하면 이전 코드는 사용할 수 없습니다. 다시 보낼 때도 현재 비밀번호를 입력하세요.</p>
        {form.resendSeconds > 0 ? <p>재발급까지 {form.resendSeconds}초 남았습니다.</p> : null}
        <button className="button button--primary" disabled={!form.canRequest}>{form.pending === "request" ? "발송 요청 중..." : form.change ? "인증코드 다시 받기" : "인증코드 받기"}</button>
      </form>
    </section>
    {form.change ? <section className="panel">
      <h2>2. 인증코드 확인</h2>
      <p className={styles.email}>인증할 주소: <strong>{form.change.newEmail}</strong></p>
      <p>만료 시각: {formatDateTime(form.change.expiresAt)} · 남은 시도 {form.change.attemptsRemaining}회</p>
      {!form.expiresSeconds ? <p className="alert alert--error" role="alert">코드가 만료되었습니다. 위에서 새 코드를 요청하세요.</p> : form.change.attemptsRemaining === 0 ? <p className="alert alert--error" role="alert">인증 시도 횟수를 모두 사용했습니다. 위에서 새 코드를 요청하세요.</p> : null}
      <form className={styles.form} onSubmit={submit(form.confirm)}>
        <label>6자리 인증코드<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={form.code} onChange={(event) => form.setCode(event.target.value.replace(/[^0-9]/g, ""))} disabled={form.busy || !form.expiresSeconds || form.change.attemptsRemaining === 0} required /></label>
        <p>확인하면 모든 기기에서 로그아웃됩니다. 새 이메일과 기존 비밀번호로 다시 로그인하세요.</p>
        <button className="button button--primary" disabled={!form.canConfirm}>{form.pending === "confirm" ? "확인 중..." : "인증하고 이메일 변경"}</button>
      </form>
    </section> : !form.query.isPending && !form.query.error ? <p>진행 중인 인증 요청이 없습니다. 새 코드를 요청해 주세요.</p> : null}
    <p className="alert alert--info">이메일 변경 후 첫 EO 안내 메일에는 새 임시 비밀번호가 포함됩니다. 해당 메일을 받은 뒤에는 임시 비밀번호로 로그인하고 개인 비밀번호를 다시 설정해야 합니다.</p>
  </div>;
}
