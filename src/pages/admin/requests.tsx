import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useAdminRequestsQuery } from "../../queries/adminDistributions";
import { errorMessage, formatDistributionListDate } from "../../utils/format";
import styles from "../../styles/page.module.css";

export default function AdminRequestsPage() {
  const requestsQuery = useAdminRequestsQuery();

  return (
    <div>
      <PageHeader
        title="보낸 EO 배포"
        description="기업별 배포 상태와 열람·다운로드 이력을 확인합니다."
        actions={<button className="button" type="button" onClick={() => requestsQuery.refetch()} disabled={requestsQuery.isFetching}>새로고침</button>}
      />
      <section className="panel">
        <div className={styles.sectionHeader}><h2>배포 목록</h2><span>{requestsQuery.data?.length ?? 0}건</span></div>
        {requestsQuery.isLoading ? <p className="page-state">목록을 불러오는 중...</p> : null}
        {requestsQuery.error ? <p className="alert alert--error">{errorMessage(requestsQuery.error)}</p> : null}
        {requestsQuery.data ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>제목</th><th>받는 회사</th><th>상태</th><th>EO 수</th><th>방문</th><th>다운로드 링크 발급</th><th>보낸 날짜</th><th></th></tr></thead>
              <tbody>
                {requestsQuery.data.map((request) => (
                  <tr key={request.id}>
                    <td className={styles.truncateCell}><span title={request.title}>{request.title}</span></td>
                    <td className={styles.truncateCell}><span title={request.company_name}>{request.company_name}</span></td>
                    <td><StatusBadge status={request.package_status} /></td>
                    <td>{request.item_count}</td><td>{request.visit_count ?? 0}</td><td>{request.download_count ?? 0}</td>
                    <td>{formatDistributionListDate(request.created_at)}</td>
                    <td><Link to={`/admin/requests/${encodeURIComponent(request.id)}`}>열기</Link></td>
                  </tr>
                ))}
                {!requestsQuery.data.length ? <tr><td colSpan={8} className="empty-cell">보낸 EO 배포가 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
