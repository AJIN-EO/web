import { Link, useParams } from "react-router-dom";
import EoDiscussionPanel from "../../components/EoDiscussionPanel";
import PageHeader from "../../components/PageHeader";
import RequestItemsTable from "../../components/RequestItemsTable";
import StatusBadge from "../../components/StatusBadge";
import { useRequestItemSelection } from "../../hooks/useRequestItemSelection";
import { useAdminRequestQuery } from "../../queries/adminDistributions";
import { errorMessage, formatDateTime } from "../../utils/format";
import styles from "../../styles/page.module.css";

export default function AdminRequestDetailPage() {
  const { id } = useParams();
  const requestQuery = useAdminRequestQuery(id);
  const itemSelection = useRequestItemSelection(requestQuery.data?.items);

  if (requestQuery.isLoading) return <p className="page-state">배포 상세를 불러오는 중...</p>;
  if (requestQuery.error) return <p className="alert alert--error">{errorMessage(requestQuery.error)}</p>;
  if (!requestQuery.data) return <p className="page-state">배포를 찾을 수 없습니다.</p>;
  const request = requestQuery.data;
  const selectedItem = itemSelection.selectedItem;

  return (
    <div>
      <PageHeader title={request.title} description={`${request.company_name} · 배포 #${request.id}`} actions={<Link className="button" to="/admin">목록으로</Link>} />
      <section className="panel">
        <div className={styles.sectionHeader}><h2>배포 정보</h2><StatusBadge status={request.package_status} /></div>
        <dl className={styles.detailGrid}>
          <div><dt>Public ID</dt><dd>{request.public_id}</dd></div>
          <div><dt>파일명</dt><dd>{request.package_filename ?? "-"}</dd></div>
          <div><dt>메일 발송</dt><dd>{formatDateTime(request.notified_at)}</dd></div>
          <div><dt>생성일</dt><dd>{formatDateTime(request.created_at)}</dd></div>
          <div className={styles.fullWidth}><dt>메시지</dt><dd>{request.message ?? "-"}</dd></div>
          {request.error_message ? <div className={styles.fullWidth}><dt>처리 오류</dt><dd className={styles.errorText}>{request.error_message}</dd></div> : null}
        </dl>
      </section>
      <section className="panel">
        <h2>EO 항목 및 처리 ({request.items.length})</h2>
        <RequestItemsTable items={request.items} selectedItemId={selectedItem?.id} onOpenDiscussion={itemSelection.selectItem} />
        {selectedItem ? <EoDiscussionPanel key={selectedItem.id} publicId={request.public_id} item={selectedItem} canResolve /> : null}
      </section>
      <section className="panel">
        <h2>NAS 검색 결과 ({request.search_results.length})</h2>
        {request.search_results.length ? <ul className={styles.pathList}>{request.search_results.map((result) => <li key={result.id}><strong>{result.eo_no}</strong><code>{result.nas_path}</code></li>)}</ul> : <p className="page-state">아직 검색 결과가 없습니다.</p>}
      </section>
      <section className="panel">
        <h2>기업 사용자 활동</h2>
        <div className={styles.activityGrid}>
          <div><h3>방문 {request.visits.length}회</h3>{request.visits.map((visit) => <p key={visit.id}>{formatDateTime(visit.visited_at)} · {visit.ip_address}</p>)}</div>
          <div><h3>다운로드 {request.downloads.length}회</h3>{request.downloads.map((download) => <p key={download.id}>{formatDateTime(download.downloaded_at)} · {download.ip_address}</p>)}</div>
        </div>
      </section>
    </div>
  );
}
