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

  return (
    <div>
      <PageHeader title={request.title} description={`${request.company_name} · 배포 #${request.id}`} actions={<Link className="button" to="/admin/requests">목록으로</Link>} />
      <section className="panel">
        <div className={styles.sectionHeader}><h2>배포 정보</h2><StatusBadge status={request.package_status} /></div>
        <dl className={styles.detailGrid}>
          <div><dt>Public ID</dt><dd>{request.public_id}</dd></div>
          <div><dt>파일명</dt><dd>{request.package_filename ?? "-"}</dd></div>
          <div><dt>메일 발송</dt><dd>{formatDateTime(request.notified_at)}</dd></div>
          <div><dt>생성일</dt><dd>{formatDateTime(request.created_at)}</dd></div>
          <div className={styles.fullWidth}><dt>메일 본문 내용</dt><dd>{request.message ?? "-"}</dd></div>
          {request.error_message ? <div className={styles.fullWidth}><dt>처리 오류</dt><dd className={styles.errorText}>{request.error_message}</dd></div> : null}
        </dl>
      </section>
      <section className="panel">
        <h2>EO 항목 및 처리 ({request.items.length})</h2>
        <RequestItemsTable
          items={request.items}
          expandedItemId={itemSelection.expandedItemId}
          onToggleItem={itemSelection.toggleItem}
          renderExpandedRow={(item) => <EoDiscussionPanel publicId={request.public_id} itemId={item.id} canResolve canReopen />}
        />
      </section>
      <section className="panel">
        <h2>NAS 검색 결과 ({request.search_results.length})</h2>
        {request.search_results.length ? <ul className={styles.pathList}>{request.search_results.map((result) => <li key={result.id}><strong>{result.eo_no}</strong><code>{result.nas_path}</code></li>)}</ul> : <p className="page-state">아직 검색 결과가 없습니다.</p>}
      </section>
      {request.items.some((item) => item.carryover_sync_id || item.nas_sources?.length) ? <section className="panel">
        <h2>배포에 포함된 원본 폴더</h2>
        <p>원본의 기업·차종은 파일 보관 위치이며 수신 기업과 다를 수 있습니다. 이 배포에 저장된 경로는 이후 차종 설정·별칭 변경으로 바뀌지 않습니다.</p>
        {request.items.filter((item) => item.carryover_sync_id || item.nas_sources?.length).map((item) => <details key={item.id}>
          <summary>{item.eo_no} · 입력 차종: {item.vehicle}</summary>
          {item.carryover_sync_id ? <p>과거 배포의 승인 기록 ID: {item.carryover_sync_id} (현재는 동기화·승인 기능을 사용하지 않습니다.)</p> : null}
          <ul className={styles.pathList}>{item.nas_sources?.map((source, index) => <li key={`${source.path}-${index}`}>
            <strong>{source.sourceCompany} / {source.sourceVehicle} · 품번 {source.partNo}</strong>
            <span>입력명에 대응하는 NAS 차종: {source.recipientVehicles.join(", ")}</span><code>{source.path}</code>
          </li>)}</ul>
        </details>)}
      </section> : null}
      <section className="panel">
        <h2>기업 사용자 활동</h2>
        <p>다운로드 기록은 링크를 발급한 횟수이며 파일 저장 완료를 뜻하지 않습니다. 관리자에게 발급한 링크도 포함됩니다.</p>
        <div className={styles.activityGrid}>
          <div><h3>방문 {request.visits.length}회</h3>{request.visits.map((visit) => <p key={visit.id}>{formatDateTime(visit.visited_at)} · {visit.ip_address}</p>)}</div>
          <div><h3>다운로드 링크 발급 {request.downloads.length}회</h3>{request.downloads.map((download) => <p key={download.id}>{formatDateTime(download.downloaded_at)} · {download.ip_address}</p>)}</div>
        </div>
      </section>
    </div>
  );
}
