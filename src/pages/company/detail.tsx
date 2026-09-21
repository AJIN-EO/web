import { Link, Navigate, useParams } from "react-router-dom";
import EoDiscussionPanel from "../../components/EoDiscussionPanel";
import PageHeader from "../../components/PageHeader";
import RequestItemsTable from "../../components/RequestItemsTable";
import StatusBadge from "../../components/StatusBadge";
import { useDistributionDownload } from "../../hooks/useDistributionDownload";
import { useRequestItemSelection } from "../../hooks/useRequestItemSelection";
import { useSession } from "../../hooks/useSession";
import { useCompanyPackageStatusQuery, useCompanyRequestQuery } from "../../queries/companyDistributions";
import { errorMessage, formatDateTime } from "../../utils/format";
import styles from "../../styles/page.module.css";

export default function CompanyRequestDetailPage() {
  const { publicId = "" } = useParams();
  const { user } = useSession();
  const requestQuery = useCompanyRequestQuery(publicId || undefined);
  const packageQuery = useCompanyPackageStatusQuery(publicId);
  const packageStatus = packageQuery.data?.package_status ?? requestQuery.data?.package_status;
  const itemSelection = useRequestItemSelection(requestQuery.data?.items);
  const download = useDistributionDownload(publicId, packageStatus);

  if (requestQuery.isLoading) return <p className="page-state">EO 배포를 불러오는 중...</p>;
  if (requestQuery.error) return <p className="alert alert--error">{errorMessage(requestQuery.error)}</p>;
  if (!requestQuery.data) return <p className="page-state">EO 배포를 찾을 수 없습니다.</p>;
  const request = requestQuery.data;

  // Keep existing mail links/bookmarks usable for administrators too.
  if (user?.role === "admin") return <Navigate to={`/admin/requests/${encodeURIComponent(request.id)}`} replace />;

  return (
    <div>
      <PageHeader title={request.title} description={`${request.company_name} · ${formatDateTime(request.created_at)}`} actions={<><button className="button" type="button" onClick={() => packageQuery.refetch()} disabled={packageQuery.isFetching}>상태 새로고침</button><Link className="button" to="/company">목록으로</Link></>} />
      {packageQuery.error ? <p className="alert alert--error" role="alert">상태 조회 실패: {errorMessage(packageQuery.error)}</p> : null}
      {packageQuery.isSuccess && packageQuery.data === null ? <p className="alert alert--info">최근 배포 목록에 없는 항목입니다. 상세를 다시 불러오면 상태가 갱신되며 방문으로 기록됩니다. <button className="button" type="button" disabled={requestQuery.isFetching} onClick={() => requestQuery.refetch()}>상세 다시 불러오기</button></p> : null}
      <section className="panel">
        <div className={styles.sectionHeader}><h2>배포 안내</h2><StatusBadge status={packageStatus ?? request.package_status} /></div>
        <p className={styles.message}>{request.message ?? "별도 메일 본문 내용이 없습니다."}</p>
        {packageStatus === "pending" || packageStatus === "processing" ? <p className="alert alert--info">다운로드 패키지를 준비하고 있습니다. 잠시 후 상태 새로고침을 눌러 주세요.</p> : null}
        {packageStatus === "failed" ? <p className="alert alert--error">패키지를 준비하지 못했습니다. 담당자에게 문의해 주세요.</p> : null}
      </section>
      <section className="panel">
        <h2>EO 내용 및 의견 ({request.items.length})</h2>
        <RequestItemsTable
          items={request.items}
          expandedItemId={itemSelection.expandedItemId}
          onToggleItem={itemSelection.toggleItem}
          renderExpandedRow={(item) => <EoDiscussionPanel publicId={request.public_id} itemId={item.id} canResolve={false} canReopen={user?.role === "company"} />}
        />
      </section>
      <section className={styles.downloadPanel}>
        <div><h2>파일 다운로드</h2><p>{packageQuery.data?.package_filename ?? request.package_filename ?? "EO 패키지"}</p></div>
        <button className="button button--primary" type="button" onClick={download.download} disabled={!download.canDownload}>{download.isDownloading ? "다운로드 준비 중..." : "다운로드"}</button>
      </section>
      {download.error ? <p className="alert alert--error" role="alert">{errorMessage(download.error)}</p> : null}
    </div>
  );
}
