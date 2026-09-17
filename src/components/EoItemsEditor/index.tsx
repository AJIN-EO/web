import {
  createEmptyEoItem,
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
  const update = (index: number, field: keyof Omit<DraftEoItem, "key">, value: string) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  return (
    <div className={styles.root}>
      {items.map((item, index) => (
        <fieldset className={styles.item} key={item.key} disabled={disabled}>
          <legend>EO 항목 {index + 1}</legend>
          <div className={styles.grid}>
            <label><span>차종<RequiredMark /></span><input value={item.vehicle} onChange={(event) => update(index, "vehicle", event.target.value)} placeholder="NAS 차종 폴더와 동일하게 입력하세요" maxLength={255} required /></label>
            <label><span>EO 번호<RequiredMark /></span><input value={item.eoNo} onChange={(event) => update(index, "eoNo", event.target.value)} placeholder="EO 번호를 입력하세요" maxLength={255} required /></label>
            <label><span>품목<RequiredMark /></span><input value={item.itemName} onChange={(event) => update(index, "itemName", event.target.value)} placeholder="품목을 입력하세요" maxLength={5000} required /></label>
            <label><span>발행일자<RequiredMark /></span><input type="datetime-local" value={item.issueDate} onChange={(event) => update(index, "issueDate", event.target.value)} step={1} required /></label>
            <label><span>적용요구시점</span><input value={item.requirement} onChange={(event) => update(index, "requirement", event.target.value)} placeholder="적용요구시점을 입력하세요" maxLength={5000} /></label>
            <label><span>변경 사유</span><input value={item.reason} onChange={(event) => update(index, "reason", event.target.value)} placeholder="변경 사유를 입력하세요" maxLength={5000} /></label>
          </div>
          <button type="button" className="button button--danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled || items.length === 1}>항목 삭제</button>
        </fieldset>
      ))}
      <button type="button" className="button" onClick={() => onChange([...items, createEmptyEoItem()])} disabled={disabled || items.length >= 100}>EO 항목 추가 ({items.length}/100)</button>
    </div>
  );
}
