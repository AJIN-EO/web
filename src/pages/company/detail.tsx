import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import RequestItemsTable from "../../components/RequestItemsTable";
import StatusBadge from "../../components/StatusBadge";
import { useCompanyRequestQuery, useDownloadDistributionMutation } from "../../queries/companyDistributions";
import { errorMessage, formatDateTime } from "../../utils/format";
import styles from "../../styles/page.module.css";

export default function CompanyRequestDetailPage() {
  const { publicId = "" } = useParams();
  const requestQuery = useCompanyRequestQuery(publicId || undefined);
  const downloadMutation = useDownloadDistributionMutation(publicId);

  const handleDownload = async () => {
    const { downloadUrl } = await downloadMutation.mutateAsync();
    window.location.assign(downloadUrl);
  };

  if (requestQuery.isLoading) return <p className="page-state">EO 배포를 불러오는 중...</p>;
  if (requestQuery.error) return <p className="alert alert--error">{errorMessage(requestQuery.error)}</p>;
  if (!requestQuery.data) return <p className="page-state">EO 배포를 찾을 수 없습니다.</p>;
  const request = requestQuery.data;

  return (
    <div>
      <PageHeader title={request.title} description={`${request.company_name} · ${formatDateTime(request.created_at)}`} actions={<><button className="button" type="button" onClick={() => requestQuery.refetch()} disabled={requestQuery.isFetching}>상태 새로고침</button><Link className="button" to="/company">목록으로</Link></>} />
      <section className="panel">
        <div className={styles.sectionHeader}><h2>배포 안내</h2><StatusBadge status={request.package_status} /></div>
        <p className={styles.message}>{request.message ?? "별도 안내 메시지가 없습니다."}</p>
        {request.package_status === "pending" || request.package_status === "processing" ? <p className="alert alert--info">다운로드 패키지를 준비하고 있습니다. 잠시 후 상태 새로고침을 눌러 주세요.</p> : null}
        {request.package_status === "failed" ? <p className="alert alert--error">패키지를 준비하지 못했습니다. 담당자에게 문의해 주세요.</p> : null}
      </section>
      <section className="panel"><h2>EO 내용 ({request.items.length})</h2><RequestItemsTable items={request.items} /></section>
      <section className={styles.downloadPanel}>
        <div><h2>파일 다운로드</h2><p>{request.package_filename ?? "EO 패키지"}</p></div>
        <button className="button button--primary" type="button" onClick={handleDownload} disabled={request.package_status !== "ready" || downloadMutation.isPending}>{downloadMutation.isPending ? "다운로드 준비 중..." : "다운로드"}</button>
      </section>
      {downloadMutation.error ? <p className="alert alert--error" role="alert">{errorMessage(downloadMutation.error)}</p> : null}
    </div>
  );
}
