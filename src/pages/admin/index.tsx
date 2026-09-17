import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import EoItemsEditor from "../../components/EoItemsEditor";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useCreateDistributionForm } from "../../hooks/useCreateDistributionForm";
import { useSession } from "../../hooks/useSession";
import { useAdminRequestsQuery } from "../../queries/adminDistributions";
import { errorMessage, formatDateTime } from "../../utils/format";
import { DEFAULT_DISTRIBUTION_MESSAGE, DEFAULT_DISTRIBUTION_TITLE } from "../../utils/distributionForm";
import styles from "../../styles/page.module.css";

export default function AdminPage() {
  const { user } = useSession();
  const enabled = user?.role === "admin";
  const requestsQuery = useAdminRequestsQuery(enabled);
  const form = useCreateDistributionForm();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <div>
      <PageHeader title="EO 배포 관리" description="기업 사용자에게 EO 배포를 보내고 처리 상태와 이력을 확인합니다." />

      <section className="panel">
        <h2>새 EO 배포</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label><span>제목</span><input value={form.title} onChange={(event) => form.setTitle(event.target.value)} placeholder={DEFAULT_DISTRIBUTION_TITLE} maxLength={500} disabled={form.isSubmitting} /></label>
            <label className={styles.fullWidth}><span>메일 본문 내용</span><textarea value={form.message} onChange={(event) => form.setMessage(event.target.value)} placeholder={DEFAULT_DISTRIBUTION_MESSAGE} maxLength={10000} rows={3} disabled={form.isSubmitting} /></label>
          </div>
          <p className="alert alert--info">차종과 EO No.를 기준으로 NAS에서 수신 기업을 찾습니다. 검색 중에는 시간이 걸릴 수 있으므로 배포 버튼을 다시 누르지 마세요.</p>
          <EoItemsEditor items={form.items} onChange={form.setItems} disabled={form.isSubmitting} />
          {form.error ? <p className="alert alert--error" role="alert">{errorMessage(form.error)}</p> : null}
          {form.routingIssues.length ? (
            <ul className={styles.routingIssues}>
              {form.routingIssues.map((issue) => (
                <li key={`${issue.itemIndex}-${issue.code}`}>
                  <strong>EO 항목 {issue.itemIndex + 1}: {issue.vehicle} / {issue.eoNo}</strong>
                  <span>{routingIssueLabel(issue.code)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className={styles.actions}><button className="button button--primary" type="submit" disabled={!form.canSubmit}>{form.isSubmitting ? "배포 생성 중..." : "배포 보내기"}</button></div>
        </form>
        {form.distributions.length ? (
          <div className="alert alert--success" role="status">
            <div className={styles.creationResultHeader}>
              <strong>{form.distributions.length}개 기업의 배포가 생성되었습니다.</strong>
              <button className="button" type="button" onClick={form.dismissResult}>확인</button>
            </div>
            <ul className={styles.creationResults}>
              {form.distributions.map((distribution) => (
                <li key={distribution.request.id}>
                  <span>{distribution.company.name} · EO {distribution.itemIndices.length}건 · {notificationLabel(distribution.notification.status)}</span>
                  <Link to={`/admin/requests/${distribution.request.id}`}>상세 보기</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className={styles.sectionHeader}>
          <h2>내가 보낸 배포</h2>
          <button className="button" type="button" onClick={() => requestsQuery.refetch()} disabled={requestsQuery.isFetching}>새로고침</button>
        </div>
        {requestsQuery.isLoading ? <p className="page-state">목록을 불러오는 중...</p> : null}
        {requestsQuery.error ? <p className="alert alert--error">{errorMessage(requestsQuery.error)}</p> : null}
        {requestsQuery.data ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>회사</th><th>제목</th><th>상태</th><th>EO 수</th><th>방문</th><th>다운로드</th><th>생성일</th><th></th></tr></thead>
              <tbody>
                {requestsQuery.data.map((request) => (
                  <tr key={request.id}>
                    <td>{request.company_name}</td><td>{request.title}</td><td><StatusBadge status={request.package_status} /></td><td>{request.item_count}</td><td>{request.visit_count ?? 0}</td><td>{request.download_count ?? 0}</td><td>{formatDateTime(request.created_at)}</td><td><Link to={`/admin/requests/${request.id}`}>상세</Link></td>
                  </tr>
                ))}
                {!requestsQuery.data.length ? <tr><td colSpan={8} className="empty-cell">보낸 배포가 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function routingIssueLabel(code: "EO_NOT_FOUND" | "COMPANY_NOT_FOUND" | "AMBIGUOUS_COMPANY") {
  return {
    EO_NOT_FOUND: "해당 차종에서 정확히 일치하는 EO 폴더를 찾지 못했습니다.",
    COMPANY_NOT_FOUND: "NAS의 기업 코드와 일치하는 활성 기업이 등록되어 있지 않습니다.",
    AMBIGUOUS_COMPANY: "둘 이상의 기업에서 동일한 차종과 EO가 발견되었습니다.",
  }[code];
}

function notificationLabel(status: "sent" | "failed" | "skipped") {
  return {
    sent: "메일 발송 접수",
    failed: "메일 발송 실패",
    skipped: "메일 발송 생략",
  }[status];
}
