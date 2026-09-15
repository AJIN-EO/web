import styles from "./style.module.css";

export interface DraftEoItem {
  key: string;
  vehicle: string;
  eoNo: string;
  itemName: string;
  issueDate: string;
  requirement: string;
  reason: string;
}

interface EoItemsEditorProps {
  items: DraftEoItem[];
  onChange: (items: DraftEoItem[]) => void;
  disabled?: boolean;
}

export const createEmptyEoItem = (): DraftEoItem => ({
  key: crypto.randomUUID(),
  vehicle: "",
  eoNo: "",
  itemName: "",
  issueDate: "",
  requirement: "",
  reason: "",
});

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
            <label>차종<input value={item.vehicle} onChange={(event) => update(index, "vehicle", event.target.value)} required /></label>
            <label>EO No.<input value={item.eoNo} onChange={(event) => update(index, "eoNo", event.target.value)} required /></label>
            <label>품명<input value={item.itemName} onChange={(event) => update(index, "itemName", event.target.value)} required /></label>
            <label>발행일<input type="date" value={item.issueDate} onChange={(event) => update(index, "issueDate", event.target.value)} /></label>
            <label>요구사항<input value={item.requirement} onChange={(event) => update(index, "requirement", event.target.value)} /></label>
            <label>사유<input value={item.reason} onChange={(event) => update(index, "reason", event.target.value)} /></label>
          </div>
          <button type="button" className="button button--danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled || items.length === 1}>항목 삭제</button>
        </fieldset>
      ))}
      <button type="button" className="button" onClick={() => onChange([...items, createEmptyEoItem()])} disabled={disabled}>EO 항목 추가</button>
    </div>
  );
}
