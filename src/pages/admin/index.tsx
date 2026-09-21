import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import EoItemsEditor from "../../components/EoItemsEditor";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useCreateDistributionForm } from "../../hooks/useCreateDistributionForm";
import { useSession } from "../../hooks/useSession";
import { useAdminRequestsQuery } from "../../queries/adminDistributions";
import { errorMessage, formatDistributionListDate } from "../../utils/format";
import { DEFAULT_DISTRIBUTION_MESSAGE, DEFAULT_DISTRIBUTION_TITLE } from "../../utils/distributionForm";
import styles from "../../styles/page.module.css";
import { getApiErrorStatus } from "../../api/client";
import { routingIssueLabel } from "../../utils/distributionErrors";
import type { DistributionNotification } from "../../api/distributions";

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
          <p className="alert alert--info"><Link to="/admin/vehicles">차종 설정</Link>에서 각 입력 차종의 수신 기업을 먼저 등록하세요. 입력 차종에 설정된 기업에만 발송하며, 같은 기업이어도 차종별로 배포·메일·ZIP·의견이 나뉩니다. 다른 차종에 원본이 있어도 수신 기업은 바뀌지 않습니다.</p>
          <EoItemsEditor items={form.items} onChange={form.setItems} disabled={form.isSubmitting} />
          {form.error && !form.routingIssues.length ? <div className="alert alert--error" role="alert">
            {getApiErrorStatus(form.error) === 409 ? <p>검색 중 수신 기업 설정·별칭 또는 기업 상태가 변경되었습니다. <Link to="/admin/vehicles">차종 설정</Link>을 확인한 뒤 다시 제출하세요. 배포는 생성되지 않았습니다.</p>
              : getApiErrorStatus(form.error) === 429 ? <p>다른 배포 검색이 진행 중입니다. 이번 배포는 저장·발송되지 않았습니다. 진행 중인 요청이 끝난 뒤 다시 제출하세요.</p>
              : getApiErrorStatus(form.error) === 502 ? <p>NAS 검색에 실패했습니다. 서버·NAS 상태를 확인한 뒤 다시 제출하세요. 배포는 생성되지 않았습니다.</p> : null}
            <p>{errorMessage(form.error)}</p>
          </div> : null}
          {form.routingIssues.length ? (
            <div role="alert"><p>배포 대상을 확인하지 못해 전체 배포가 취소되었습니다. 저장 및 메일 발송은 이루어지지 않았습니다.</p><ul className={styles.routingIssues}>
              {form.routingIssues.map((issue, index) => (
                <li key={`${issue.itemIndex}-${issue.code}-${index}`}>
                  <strong>EO 항목 {issue.itemIndex + 1} · 차종 {issue.vehicleIndex + 1}: {issue.vehicle} / {issue.eoNo}</strong>
                  <span>{routingIssueLabel(issue.code, issue.message)}</span>
                  {["VEHICLE_COMPANY_NOT_CONFIGURED", "COMPANY_NOT_FOUND", "VEHICLE_NOT_FOUND", "AMBIGUOUS_COMPANY"].includes(issue.code) ? <Link to="/admin/vehicles">차종 설정 확인</Link> : null}
                </li>
              ))}
            </ul></div>
          ) : null}
          <div className={styles.actions}><button className="button button--primary" type="submit" disabled={!form.canSubmit}>{form.isSubmitting ? "배포 생성 중..." : "배포 보내기"}</button></div>
        </form>
        {form.distributions.length ? (
          <div className="alert alert--success" role="status">
            <div className={styles.creationResultHeader}>
              <strong>{form.distributions.length}건의 차종별 배포가 생성되었습니다. ({new Set(form.distributions.map((distribution) => distribution.company.id)).size}개 기업)</strong>
              <button className="button" type="button" onClick={form.dismissResult}>확인</button>
            </div>
            <ul className={styles.creationResults}>
              {form.distributions.map((distribution) => (
                <li key={distribution.request.id}>
                  <div>
                    <strong>{distribution.company.name} · {distribution.vehicle}</strong>
                    <p>EO {distribution.itemRefs.length}건 · {notificationLabel(distribution.notification)}</p>
                    <small>입력 위치: {distribution.itemRefs.map((ref) => `EO ${ref.itemIndex + 1} / 차종 ${ref.vehicleIndex + 1}`).join(", ")}</small>
                  </div>
                  <Link to={`/admin/requests/${distribution.request.id}`}>상세 보기</Link>
                </li>
              ))}
            </ul>
            <p>배포가 저장되었습니다. ZIP 준비 상태는 상세에서 확인하세요. 메일 실패·생략을 이유로 같은 EO를 다시 제출하면 중복 배포됩니다.</p>
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
              <thead><tr><th>회사</th><th>제목</th><th>상태</th><th>EO 수</th><th>방문</th><th>다운로드 링크 발급</th><th>생성일</th><th></th></tr></thead>
              <tbody>
                {requestsQuery.data.slice(0, 5).map((request) => (
                  <tr key={request.id}>
                    <td className={styles.truncateCell}><span title={request.company_name}>{request.company_name}</span></td><td className={styles.truncateCell}><span title={request.title}>{request.title}</span></td><td><StatusBadge status={request.package_status} /></td><td>{request.item_count}</td><td>{request.visit_count ?? 0}</td><td>{request.download_count ?? 0}</td><td>{formatDistributionListDate(request.created_at)}</td><td><Link to={`/admin/requests/${request.id}`}>상세</Link></td>
                  </tr>
                ))}
                {!requestsQuery.data.length ? <tr><td colSpan={8} className="empty-cell">보낸 배포가 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}
        {requestsQuery.data?.length ? <div className={styles.listFooter}><Link className="button" to="/admin/requests">더보기</Link></div> : null}
      </section>
    </div>
  );
}

function notificationLabel(notification: DistributionNotification) {
  if (notification.trackingError) return "메일 발송 접수 · 발송 기록 저장 실패";
  if (notification.status === "skipped" && notification.reason === "no_recipients") return "메일 생략 · 활성 수신 계정 없음";
  if (notification.status === "skipped" && notification.reason === "email_disabled") return "메일 생략 · 발송 기능 꺼짐";
  return {
    sent: "메일 발송 접수",
    failed: "메일 발송 실패",
    skipped: "메일 발송 생략",
  }[notification.status];
}
