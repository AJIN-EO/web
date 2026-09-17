import { Fragment, type KeyboardEvent, type ReactNode } from "react";
import type { EoItem } from "../../types/api";
import { formatIssueDate } from "../../utils/format";
import DiscussionStatusBadge from "../DiscussionStatusBadge";
import styles from "./style.module.css";

interface Props {
  items: EoItem[];
  expandedItemId?: string;
  onToggleItem?: (item: EoItem) => void;
  renderExpandedRow?: (item: EoItem) => ReactNode;
}

export default function RequestItemsTable({ items, expandedItemId, onToggleItem, renderExpandedRow }: Props) {
  const isExpandable = Boolean(onToggleItem && renderExpandedRow);

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, item: EoItem) => {
    if (!onToggleItem || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onToggleItem(item);
  };

  return (
    <div className={styles.wrapper}>
      <table>
        <thead>
          <tr>
            <th>차종</th><th>EO 번호</th><th>품목</th><th>발행일자</th><th>적용요구시점</th><th>변경 사유</th><th>처리 상태</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <Fragment key={item.id}>
                <tr
                  className={`${styles.dataRow} ${isExpandable ? styles.expandable : ""} ${isExpanded ? styles.expanded : ""}`.trim()}
                  onClick={isExpandable ? () => onToggleItem?.(item) : undefined}
                  onKeyDown={isExpandable ? (event) => handleKeyDown(event, item) : undefined}
                  tabIndex={isExpandable ? 0 : undefined}
                  aria-expanded={isExpandable ? isExpanded : undefined}
                  title={isExpandable ? `클릭하여 ${isExpanded ? "의견 접기" : "의견 펼치기"}` : undefined}
                >
                  <td>{displayCellValue(item.vehicle)}</td>
                  <td>{displayCellValue(item.eo_no)}</td>
                  <td>{displayCellValue(item.item_name)}</td>
                  <td>{formatIssueDate(item.issue_date, item.issue_date_precision)}</td>
                  <td>{displayCellValue(item.requirement)}</td>
                  <td>{displayCellValue(item.reason)}</td>
                  <td><DiscussionStatusBadge status={item.discussion_status} /></td>
                </tr>
                {isExpanded && renderExpandedRow ? (
                  <tr className={styles.expandedRow}>
                    <td className={styles.expandedCell} colSpan={7}>{renderExpandedRow(item)}</td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function displayCellValue(value: string | null | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue || "-";
}
