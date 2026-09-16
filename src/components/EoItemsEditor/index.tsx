import {
  createEmptyEoItem,
  type DraftEoItem,
} from "../../utils/distributionForm";
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
            <label>차종<input value={item.vehicle} onChange={(event) => update(index, "vehicle", event.target.value)} placeholder="차종을 입력하세요" required /></label>
            <label>EO No.<input value={item.eoNo} onChange={(event) => update(index, "eoNo", event.target.value)} placeholder="EO No.를 입력하세요" required /></label>
            <label>품목<input value={item.itemName} onChange={(event) => update(index, "itemName", event.target.value)} placeholder="품목을 입력하세요" required /></label>
            <label>발행일자<input type="datetime-local" value={item.issueDate} onChange={(event) => update(index, "issueDate", event.target.value)} required /></label>
            <label>적용요구시점<input value={item.requirement} onChange={(event) => update(index, "requirement", event.target.value)} placeholder="적용요구시점을 입력하세요" required /></label>
            <label>변경 사유<input value={item.reason} onChange={(event) => update(index, "reason", event.target.value)} placeholder="변경 사유를 입력하세요" required /></label>
          </div>
          <button type="button" className="button button--danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled || items.length === 1}>항목 삭제</button>
        </fieldset>
      ))}
      <button type="button" className="button" onClick={() => onChange([...items, createEmptyEoItem()])} disabled={disabled}>EO 항목 추가</button>
    </div>
  );
}
