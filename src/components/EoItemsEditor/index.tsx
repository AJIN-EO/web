import {
  createEmptyEoItem,
  countEoVehiclePairs,
  hasDuplicateVehicles,
  isValidVehicleName,
  type DraftEoItem,
} from "../../utils/distributionForm";
import RequiredMark from "../RequiredMark";
import styles from "./style.module.css";

export type { DraftEoItem } from "../../utils/distributionForm";
export { createEmptyEoItem } from "../../utils/distributionForm";

interface EoItemsEditorProps {
  items: DraftEoItem[];
  onChange: (items: DraftEoItem[]) => void;
  disabled?: boolean;
}

export default function EoItemsEditor({ items, onChange, disabled }: EoItemsEditorProps) {
  const pairCount = countEoVehiclePairs(items);
  const update = (index: number, field: keyof Omit<DraftEoItem, "key" | "vehicles">, value: string) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };
  const updateVehicles = (index: number, vehicles: string[]) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, vehicles } : item));
  };

  return (
    <div className={styles.root}>
      <p className={styles.help}>EO별로 배포할 차종을 하나씩 추가하세요. 같은 기업이어도 입력 차종별로 별도 배포됩니다. 전체 EO·차종 조합 {pairCount} / 100개</p>
      {items.map((item, index) => (
        <fieldset className={styles.item} key={item.key} disabled={disabled}>
          <legend>EO 항목 {index + 1}</legend>
          <div className={styles.vehicles}>
            {item.vehicles.map((vehicle, vehicleIndex) => <div className={styles.vehicleRow} key={vehicleIndex}>
              <label><span>차종 {vehicleIndex + 1}<RequiredMark /></span><input
                aria-label={`EO 항목 ${index + 1} 차종 ${vehicleIndex + 1}`}
                value={vehicle}
                onChange={(event) => updateVehicles(index, item.vehicles.map((name, position) => position === vehicleIndex ? event.target.value : name))}
                placeholder="수신 기업을 설정한 차종명 또는 별칭" maxLength={255} required
              /></label>
              <button className="button button--danger" type="button" aria-label={`EO 항목 ${index + 1} 차종 ${vehicleIndex + 1} 삭제`} disabled={disabled || item.vehicles.length === 1} onClick={() => updateVehicles(index, item.vehicles.filter((_, position) => position !== vehicleIndex))}>삭제</button>
            </div>)}
            {hasDuplicateVehicles(item.vehicles) ? <p className="alert alert--error" role="alert">같은 EO에 중복 차종을 입력할 수 없습니다. 앞뒤 공백과 한글 표기 정규화 후 같은 이름도 중복입니다.</p> : null}
            {item.vehicles.some((name) => name && !isValidVehicleName(name)) ? <p className="alert alert--error" role="alert">차종은 공백만 입력하거나 경로 구분자·제어문자·.·..를 사용할 수 없습니다.</p> : null}
            <button type="button" className="button" onClick={() => updateVehicles(index, [...item.vehicles, ""])} disabled={disabled || pairCount >= 100 || item.vehicles.length >= 100}>차종 추가</button>
          </div>
          <div className={styles.grid}>
            <label><span>EO 번호<RequiredMark /></span><input value={item.eoNo} onChange={(event) => update(index, "eoNo", event.target.value)} placeholder="EO 번호를 입력하세요" maxLength={255} required /></label>
            <label><span>품목<RequiredMark /></span><input value={item.itemName} onChange={(event) => update(index, "itemName", event.target.value)} placeholder="품목을 입력하세요" maxLength={5000} required /></label>
            <label><span>발행일자<RequiredMark /></span><input type="datetime-local" value={item.issueDate} onChange={(event) => update(index, "issueDate", event.target.value)} step={1} required /></label>
            <label><span>적용요구시점</span><input value={item.requirement} onChange={(event) => update(index, "requirement", event.target.value)} placeholder="적용요구시점을 입력하세요" maxLength={5000} /></label>
            <label><span>변경 사유</span><input value={item.reason} onChange={(event) => update(index, "reason", event.target.value)} placeholder="변경 사유를 입력하세요" maxLength={5000} /></label>
          </div>
          <button type="button" className="button button--danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled || items.length === 1}>항목 삭제</button>
        </fieldset>
      ))}
      <button type="button" className="button" onClick={() => onChange([...items, createEmptyEoItem()])} disabled={disabled || items.length >= 100 || pairCount >= 100}>EO 항목 추가 ({items.length}/100)</button>
    </div>
  );
}
