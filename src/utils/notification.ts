import type { DistributionNotification } from "../api/distributions";

export function notificationLabel(notification: Pick<DistributionNotification, "status" | "trackingError"> & { reason?: string }) {
  const reasons: Record<string, string> = {
    no_recipients: "활성 수신 계정 없음",
    email_disabled: "발송 기능 꺼짐",
    recipient_inactive: "비활성 수신 계정",
  };
  const status = { sent: "메일 발송 접수", partial: "일부 담당자만 메일 발송 접수", failed: "메일 발송 실패", skipped: "메일 발송 생략" }[notification.status];
  const reason = notification.reason && Object.hasOwn(reasons, notification.reason) ? ` · ${reasons[notification.reason]}` : "";
  return `${status}${reason}${notification.trackingError ? " · 발송 기록 저장 실패" : ""}`;
}
