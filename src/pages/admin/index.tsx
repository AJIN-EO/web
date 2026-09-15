import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import EoItemsEditor, { createEmptyEoItem, type DraftEoItem } from "../../components/EoItemsEditor";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useSession } from "../../hooks/useSession";
import { useAdminRequestsQuery, useCreateDistributionMutation } from "../../queries/adminDistributions";
import { useCompaniesQuery } from "../../queries/companies";
import { errorMessage, formatDateTime } from "../../utils/format";
import styles from "../../styles/page.module.css";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const enabled = user?.role === "admin" || user?.role === "staff";
  const companiesQuery = useCompaniesQuery(enabled);
  const requestsQuery = useAdminRequestsQuery(enabled);
  const createMutation = useCreateDistributionMutation();
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("EO 데이터 다운로드");
  const [message, setMessage] = useState("확인 후 다운로드 바랍니다.");
  const [items, setItems] = useState<DraftEoItem[]>([createEmptyEoItem()]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const { request } = await createMutation.mutateAsync({
      companyId: Number(companyId),
      title: title.trim(),
      message: message.trim() || null,
      items: items.map((item) => ({
        vehicle: item.vehicle.trim(),
        eoNo: item.eoNo.trim(),
        itemName: item.itemName.trim(),
        issueDate: item.issueDate || null,
        requirement: item.requirement.trim() || null,
        reason: item.reason.trim() || null,
      })),
    });
    navigate(`/admin/requests/${request.id}`);
  };

  return (
    <div>
      <PageHeader title="EO 배포 관리" description="기업 사용자에게 EO 배포를 보내고 처리 상태와 이력을 확인합니다." />

      <section className="panel">
        <h2>새 EO 배포</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label>받는 회사
              <select value={companyId} onChange={(event) => setCompanyId(event.target.value)} required disabled={companiesQuery.isLoading || createMutation.isPending}>
                <option value="">회사를 선택하세요</option>
                {companiesQuery.data?.map((company) => <option key={company.id} value={company.id}>{company.code} · {company.name}</option>)}
              </select>
            </label>
            <label>제목<input value={title} onChange={(event) => setTitle(event.target.value)} required disabled={createMutation.isPending} /></label>
            <label className={styles.fullWidth}>안내 메시지<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} disabled={createMutation.isPending} /></label>
          </div>
          {companiesQuery.error ? <p className="alert alert--error">회사 목록: {errorMessage(companiesQuery.error)}</p> : null}
          <EoItemsEditor items={items} onChange={setItems} disabled={createMutation.isPending} />
          {createMutation.error ? <p className="alert alert--error" role="alert">{errorMessage(createMutation.error)}</p> : null}
          <div className={styles.actions}><button className="button button--primary" type="submit" disabled={createMutation.isPending || !companyId}>{createMutation.isPending ? "배포 생성 중..." : "배포 보내기"}</button></div>
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
                    <td>{request.company_code} · {request.company_name}</td><td>{request.title}</td><td><StatusBadge status={request.package_status} /></td><td>{request.item_count}</td><td>{request.visit_count ?? 0}</td><td>{request.download_count ?? 0}</td><td>{formatDateTime(request.created_at)}</td><td><Link to={`/admin/requests/${request.id}`}>상세</Link></td>
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
