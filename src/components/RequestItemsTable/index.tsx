import type { EoItem } from "../../types/api";
import { formatDateTime } from "../../utils/format";
import DiscussionStatusBadge from "../DiscussionStatusBadge";
import styles from "./style.module.css";

interface Props {
  items: EoItem[];
  selectedItemId?: string;
  onOpenDiscussion?: (item: EoItem) => void;
}

export default function RequestItemsTable({ items, selectedItemId, onOpenDiscussion }: Props) {
  return (
    <div className={styles.wrapper}>
      <table>
        <thead>
          <tr>
            <th>차종</th><th>EO No.</th><th>품목</th><th>발행일자</th><th>적용요구시점</th><th>변경 사유</th><th>처리 상태</th>{onOpenDiscussion ? <th>의견</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={selectedItemId === item.id ? styles.selected : undefined}>
              <td>{item.vehicle}</td>
              <td>{item.eo_no}</td>
              <td>{item.item_name}</td>
              <td>{formatDateTime(item.issue_date)}</td>
              <td>{item.requirement ?? "-"}</td>
              <td>{item.reason ?? "-"}</td>
              <td><DiscussionStatusBadge status={item.discussion_status} /></td>
              {onOpenDiscussion ? <td><button className="button" type="button" onClick={() => onOpenDiscussion(item)}>{selectedItemId === item.id ? "선택됨" : "의견 보기"}</button></td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
