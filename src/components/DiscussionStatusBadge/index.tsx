import type { DiscussionStatus } from "../../types/api";
import styles from "./style.module.css";

const labels: Record<DiscussionStatus, string> = {
  active: "활성",
  modified: "수정 완료",
  not_required: "수정 불필요",
};

export default function DiscussionStatusBadge({ status }: { status: DiscussionStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{labels[status]}</span>;
}
