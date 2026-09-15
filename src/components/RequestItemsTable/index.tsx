import type { EoItem } from "../../types/api";
import styles from "./style.module.css";

export default function RequestItemsTable({ items }: { items: EoItem[] }) {
  return (
    <div className={styles.wrapper}>
      <table>
        <thead>
          <tr>
            <th>차종</th><th>EO No.</th><th>품명</th><th>발행일</th><th>요구사항</th><th>사유</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.vehicle}</td>
              <td>{item.eo_no}</td>
              <td>{item.item_name}</td>
              <td>{item.issue_date ?? "-"}</td>
              <td>{item.requirement ?? "-"}</td>
              <td>{item.reason ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
