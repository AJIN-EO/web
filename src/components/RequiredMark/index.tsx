import styles from "./style.module.css";

export default function RequiredMark() {
  return <span className={styles.mark} aria-label="필수">*</span>;
}
