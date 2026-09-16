import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import EoItemsEditor from "../../components/EoItemsEditor";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useCreateDistributionForm } from "../../hooks/useCreateDistributionForm";
import { useSession } from "../../hooks/useSession";
import { useAdminRequestsQuery } from "../../queries/adminDistributions";
import { errorMessage, formatDateTime } from "../../utils/format";
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
            <label>제목<input value={form.title} onChange={(event) => form.setTitle(event.target.value)} placeholder="배포 제목을 입력하세요" required disabled={form.isSubmitting} /></label>
            <label className={styles.fullWidth}>안내 메시지<textarea value={form.message} onChange={(event) => form.setMessage(event.target.value)} placeholder="기업 담당자에게 전달할 안내 메시지를 입력하세요" rows={3} disabled={form.isSubmitting} /></label>
          </div>
          <EoItemsEditor items={form.items} onChange={form.setItems} disabled={form.isSubmitting} />
          {form.error ? <p className="alert alert--error" role="alert">{errorMessage(form.error)}</p> : null}
          <div className={styles.actions}><button className="button button--primary" type="submit" disabled={!form.canSubmit}>{form.isSubmitting ? "배포 생성 중..." : "배포 보내기"}</button></div>
        </form>
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
