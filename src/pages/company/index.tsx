import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useSession } from "../../hooks/useSession";
import { useCompanyRequestsQuery } from "../../queries/companyDistributions";
import { errorMessage, formatDistributionListDate } from "../../utils/format";
import styles from "../../styles/page.module.css";

export default function CompanyPage() {
  const { user } = useSession();
  const isAdmin = user?.role === "admin";
  const requestsQuery = useCompanyRequestsQuery();

  return (
    <div>
      <PageHeader
        title={isAdmin ? "보낸 EO 배포" : "받은 EO 배포"}
        description={isAdmin ? "기업 사용자에게 보낸 EO 배포를 확인합니다." : "내 회사로 전달된 EO 배포를 확인하고 준비된 파일을 다운로드합니다."}
        actions={<button className="button" type="button" onClick={() => requestsQuery.refetch()} disabled={requestsQuery.isFetching}>새로고침</button>}
      />
      <section className="panel">
        <div className={styles.sectionHeader}><h2>배포 목록</h2><span>{requestsQuery.data?.length ?? 0}건</span></div>
        {requestsQuery.isLoading ? <p className="page-state">목록을 불러오는 중...</p> : null}
        {requestsQuery.error ? <p className="alert alert--error">{errorMessage(requestsQuery.error)}</p> : null}
        {requestsQuery.data ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>제목</th><th>보낸 회사</th><th>상태</th><th>EO 수</th><th>받은 날짜</th><th></th></tr></thead>
              <tbody>
                {requestsQuery.data.map((request) => (
                  <tr key={request.public_id}>
                    <td className={styles.truncateCell}><span title={request.title}>{request.title}</span></td><td className={styles.truncateCell}><span title={request.company_name}>{request.company_name}</span></td><td><StatusBadge status={request.package_status} /></td><td>{request.item_count}</td><td>{formatDistributionListDate(request.created_at)}</td><td><Link to={`/company/requests/${request.public_id}`}>열기</Link></td>
                  </tr>
                ))}
                {!requestsQuery.data.length ? <tr><td colSpan={6} className="empty-cell">받은 EO 배포가 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
