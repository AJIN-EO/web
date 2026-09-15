import type { PackageStatus } from "../../types/api";
import styles from "./style.module.css";

const labels: Record<PackageStatus, string> = {
  pending: "대기 중",
  processing: "처리 중",
  ready: "다운로드 가능",
  failed: "실패",
};

export default function StatusBadge({ status }: { status: PackageStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{labels[status]}</span>;
}
