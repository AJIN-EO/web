export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ko-KR");
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
