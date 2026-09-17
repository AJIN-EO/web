export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ko-KR");
}

export function formatDistributionListDate(value: string | null | undefined, now = new Date()) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const isToday = date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();

  return isToday
    ? date.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString("ko-KR", { year: "numeric", month: "numeric", day: "numeric" });
}

export function formatIssueDate(
  value: string | null | undefined,
  precision: "date" | "datetime" | null | undefined,
) {
  if (!value) return "-";
  return precision === "date" ? value : formatDateTime(value);
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.";
}
