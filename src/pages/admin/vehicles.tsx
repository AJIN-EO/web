import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { getApiErrorStatus } from "../../api/client";
import { useCompaniesQuery, useVehicleActionMutation, useVehicleAliasesQuery, useVehicleCompaniesQuery } from "../../queries/vehicles";
import type { Company } from "../../types/api";
import type { VehicleCompany } from "../../types/vehicles";
import { isValidVehicleName, normalizeVehicleName } from "../../utils/distributionForm";
import { errorMessage } from "../../utils/format";
import styles from "../../styles/page.module.css";

type CompanyOptions = { companies: Company[]; companiesUnavailable: boolean };

export default function VehicleSettingsPage() {
  const companies = useCompaniesQuery();
  const location = useLocation();
  const options = { companies: companies.data?.filter((company) => company.is_active) ?? [], companiesUnavailable: companies.isPending || companies.isError };
  return <div>
    <PageHeader title="차종 및 수신 기업 설정" description="메일을 받을 기업과 파일을 찾을 NAS 위치를 각각 설정합니다." actions={<Link className="button" to="/admin">EO 배포</Link>} />
    {(location.state as { retiredSync?: boolean } | null)?.retiredSync ? <p className="alert alert--info">엑셀 동기화·승인 기능은 종료되었습니다. 현재는 아래 차종별 수신 기업 설정을 사용하며 기존 배포 기록은 유지됩니다.</p> : null}
    <p className="alert alert--info">① EO에 입력할 차종명으로 수신 기업을 등록하세요. ② 입력명과 NAS 차종 폴더명이 다르면 검색용 별칭도 등록하세요. 설정은 다음 배포부터 적용되며 메일은 발송하지 않습니다.</p>
    {companies.error ? <p className="alert alert--error" role="alert">기업 목록을 불러오지 못했습니다. {errorMessage(companies.error)} <button type="button" className="button" onClick={() => void companies.refetch()}>기업 다시 조회</button></p> : null}
    {!companies.isPending && !companies.isError && !options.companies.length ? <p className="alert alert--info">선택할 활성 기업이 없습니다. 서버에서 기업을 등록한 후 <button className="button" type="button" onClick={() => void companies.refetch()}>기업 다시 조회</button>해 주세요.</p> : null}
    <VehicleCompanySettings {...options} />
    <VehicleAliasSettings {...options} />
  </div>;
}

function VehicleCompanySettings({ companies, companiesUnavailable }: CompanyOptions) {
  const query = useVehicleCompaniesQuery();
  const mutation = useVehicleActionMutation();
  const [vehicle, setVehicle] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  // Preserve the version the user actually selected, even if a background GET refreshes the list.
  const [editing, setEditing] = useState<VehicleCompany | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [notice, setNotice] = useState("");
  const disabled = mutation.isPending || query.isPending || query.isError || query.isFetching;
  const validCompany = (code: string) => companies.some((company) => company.code === code);

  const run = async (action: Parameters<typeof mutation.mutateAsync>[0], success: string) => {
    setNotice("");
    try {
      await mutation.mutateAsync(action);
      setEditing(null);
      setNotice(success);
      return true;
    } catch (error) {
      if ([404, 409].includes(getApiErrorStatus(error) ?? 0)) setEditing(null);
      return false;
    }
  };
  const add = async (event: FormEvent) => {
    event.preventDefault();
    if (disabled || companiesUnavailable || !isValidVehicleName(vehicle) || !validCompany(companyCode)) return;
    if (await run({ type: "addMapping", vehicle: normalizeVehicleName(vehicle), companyCode }, "수신 기업 설정을 등록했습니다. 이 입력 차종의 다음 배포부터 적용됩니다.")) setVehicle("");
  };

  return <section className="panel" id="recipients">
    <div className={styles.sectionHeader}><h2>1. 차종별 수신 기업</h2><button type="button" className="button" disabled={mutation.isPending || query.isFetching} onClick={() => { setEditing(null); void query.refetch(); }}>수신 설정 새로고침</button></div>
    <p>입력 차종 하나에 수신 기업 하나를 지정합니다. 초기 설정은 비어 있으며 등록되지 않은 차종이 있으면 전체 배포가 중단됩니다.</p>
    <p>별칭을 입력할 경우에도 그 별칭 이름으로 수신 기업을 직접 등록해야 합니다. 같은 기업이 여러 차종을 담당해도 배포·메일·ZIP·의견은 차종별로 분리됩니다.</p>
    {notice ? <p className="alert alert--success" role="status">{notice}</p> : null}
    <SettingsError error={mutation.error} />
    {query.isPending ? <p>수신 기업 설정을 불러오는 중...</p> : null}
    {query.error ? <p className="alert alert--error" role="alert">{errorMessage(query.error)}</p> : null}
    {query.data?.length ? <div className="table-scroll"><table>
      <thead><tr><th>EO 입력 차종명</th><th>수신 기업</th><th>기업 상태</th><th>관리</th></tr></thead>
      <tbody>{query.data.map((mapping) => <tr key={mapping.id}>
        <td>{mapping.vehicle}</td>
        <td>{editing?.id === mapping.id ? <select aria-label={`${mapping.vehicle} 수신 기업 변경`} value={editCompany} disabled={disabled || companiesUnavailable} onChange={(event) => setEditCompany(event.target.value)}>
          <option value="">활성 기업 선택</option><CompanyChoices companies={companies} />
        </select> : `${mapping.company_name} (${mapping.company_code})`}</td>
        <td>{mapping.company_is_active ? "활성" : <strong className={styles.errorText}>비활성 · 배포 불가</strong>}</td>
        <td><div className={styles.inlineActions}>{editing?.id === mapping.id ? <>
          <button type="button" className="button button--primary" disabled={disabled || companiesUnavailable || !validCompany(editCompany) || editCompany === editing.company_code} onClick={() => void run({ type: "updateMapping", id: editing.id, companyCode: editCompany, expectedVersion: editing.version }, "수신 기업을 변경했습니다. 기존 배포의 접근 권한은 유지됩니다.")}>저장</button>
          <button type="button" className="button" disabled={mutation.isPending} onClick={() => setEditing(null)}>취소</button>
        </> : <>
          <button type="button" className="button" disabled={disabled || companiesUnavailable} onClick={() => { mutation.reset(); setEditing(mapping); setEditCompany(mapping.company_is_active ? mapping.company_code : ""); }}>기업 변경</button>
          <button type="button" className="button button--danger" disabled={disabled} onClick={() => {
            if (window.confirm(`'${mapping.vehicle}' 수신 기업 설정을 삭제하시겠습니까? 다시 설정할 때까지 이 차종의 신규 배포가 불가능합니다. 기존 배포는 유지됩니다.`)) void run({ type: "deleteMapping", id: mapping.id, expectedVersion: mapping.version }, "수신 기업 설정을 삭제했습니다. 해당 차종을 다시 배포하려면 설정을 등록하세요.");
          }}>삭제</button>
        </>}</div></td>
      </tr>)}</tbody>
    </table></div> : query.data ? <p>등록된 수신 기업 설정이 없습니다.</p> : null}
    <form className={styles.form} onSubmit={add}>
      <fieldset className={styles.settingsFields} disabled={disabled || companiesUnavailable}>
        <label>EO 입력 차종명<input value={vehicle} onChange={(event) => setVehicle(event.target.value)} placeholder="예: MX5(P6)" maxLength={255} required /></label>
        <label><span>메일 수신 기업</span><select aria-label="메일 수신 기업" value={companyCode} onChange={(event) => setCompanyCode(event.target.value)} required><option value="">기업 선택</option><CompanyChoices companies={companies} /></select></label>
      </fieldset>
      <p className={styles.formHelp}>차종명 변경은 기존 설정을 삭제한 뒤 새로 등록합니다. NAS 폴더의 기업과 수신 기업은 달라도 됩니다.</p>
      <div className={styles.actions}><button className="button button--primary" disabled={disabled || companiesUnavailable || !isValidVehicleName(vehicle) || !validCompany(companyCode)}>수신 기업 등록</button></div>
    </form>
  </section>;
}

function VehicleAliasSettings({ companies, companiesUnavailable }: CompanyOptions) {
  const query = useVehicleAliasesQuery();
  const mutation = useVehicleActionMutation();
  const [alias, setAlias] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [notice, setNotice] = useState("");
  const disabled = mutation.isPending || query.isPending || query.isError || query.isFetching;
  const canAdd = !disabled && !companiesUnavailable && isValidVehicleName(alias) && isValidVehicleName(vehicle) && companies.some((company) => company.code === companyCode);
  const add = async (event: FormEvent) => {
    event.preventDefault();
    if (!canAdd) return;
    setNotice("");
    try {
      await mutation.mutateAsync({ type: "addAlias", alias: normalizeVehicleName(alias), companyCode, vehicle: normalizeVehicleName(vehicle) });
      setAlias(""); setVehicle("");
      setNotice("NAS 검색용 별칭을 등록했습니다. 입력 별칭의 수신 기업 설정도 별도로 확인하세요.");
    } catch { /* The server error remains visible. */ }
  };
  return <section className="panel" id="aliases">
    <div className={styles.sectionHeader}><h2>2. NAS 검색용 별칭</h2><button type="button" className="button" disabled={mutation.isPending || query.isFetching} onClick={() => void query.refetch()}>별칭 새로고침</button></div>
    <p>입력 차종명과 실제 NAS 폴더명이 다를 때만 연결합니다. 여기의 기업은 파일을 찾을 NAS 기업 폴더이며 메일 수신 기업을 지정하지 않습니다.</p>
    <p>예: MX5(P6) → HMC / MX5-CAR(P6). 저장 즉시 다음 배포부터 사용하며, 폴더의 존재와 유일성은 배포 시 검사합니다.</p>
    {notice ? <p className="alert alert--success" role="status">{notice}</p> : null}
    <SettingsError error={mutation.error} />
    {query.isPending ? <p>별칭을 불러오는 중...</p> : null}
    {query.error ? <p className="alert alert--error" role="alert">{errorMessage(query.error)}</p> : null}
    {query.data?.length ? <div className="table-scroll"><table>
      <thead><tr><th>입력 별칭</th><th>NAS 기업 폴더</th><th>실제 NAS 차종명</th><th>관리</th></tr></thead>
      <tbody>{query.data.map((entry) => <tr key={entry.id}>
        <td>{entry.alias}</td><td>{entry.company_code}</td><td>{entry.vehicle}</td>
        <td><button type="button" className="button button--danger" disabled={disabled} onClick={async () => {
          if (!window.confirm(`별칭 '${entry.alias}'을 삭제하시겠습니까? 다음 배포부터 적용되며 기존 배포는 유지됩니다.`)) return;
          setNotice("");
          try { await mutation.mutateAsync({ type: "deleteAlias", id: entry.id }); setNotice("별칭을 삭제했습니다. 입력명과 NAS 폴더명이 다르면 올바른 연결을 다시 등록하세요."); } catch { /* Render the error below. */ }
        }}>삭제</button></td>
      </tr>)}</tbody>
    </table></div> : query.data ? <p>등록된 별칭이 없습니다.</p> : null}
    <form className={styles.form} onSubmit={add}>
      <fieldset className={styles.aliasFields} disabled={disabled || companiesUnavailable}>
        <label>입력 별칭<input value={alias} onChange={(event) => setAlias(event.target.value)} maxLength={255} placeholder="예: MX5(P6)" required /></label>
        <label><span>NAS 기업 폴더</span><select aria-label="NAS 기업 폴더" value={companyCode} onChange={(event) => setCompanyCode(event.target.value)} required><option value="">기업 코드 선택</option><CompanyChoices companies={companies} /></select></label>
        <label>실제 NAS 차종명<input value={vehicle} onChange={(event) => setVehicle(event.target.value)} maxLength={255} placeholder="예: MX5-CAR(P6)" required /></label>
      </fieldset>
      <p className={styles.formHelp}>같은 별칭은 덮어쓰지 않습니다. 변경하려면 기존 별칭을 삭제한 뒤 등록하세요.</p>
      <div className={styles.actions}><button className="button" disabled={!canAdd}>별칭 등록</button></div>
    </form>
  </section>;
}

function CompanyChoices({ companies }: { companies: Company[] }) {
  return companies.map((company) => <option key={company.id} value={company.code}>{company.name} ({company.code})</option>);
}
function SettingsError({ error }: { error: unknown }) {
  if (!error) return null;
  return <div className="alert alert--error" role="alert">
    <p>{getApiErrorStatus(error) === 409 ? "이미 등록된 이름이거나 다른 관리자가 먼저 설정을 변경했습니다. 새로 조회한 목록을 확인하고 수정할 항목을 다시 선택하세요." : "요청을 완료하지 못했습니다. 현재 목록과 입력값을 확인하세요."}</p>
    <p>{errorMessage(error)}</p>
  </div>;
}
