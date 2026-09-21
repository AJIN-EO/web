import type { SessionUser, UserRole } from "../types/api";

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, "https://eo.internal");
    if (url.origin !== "https://eo.internal" || !/^\/(?:$|company(?:\/|$)|admin(?:\/|$)|account\/email$)/.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}

export const landingPath = (role: UserRole) => role === "admin" ? "/admin" : "/company";
export const isValidEmail = (value: string) => value.trim().length <= 254 && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(value.trim());
export const passwordChangePath = (next: string) => `/change-password?next=${encodeURIComponent(safeNextPath(next) ?? "/")}`;
export function sessionDestination(user: SessionUser, next?: string | null) {
  const destination = safeNextPath(next) ?? landingPath(user.role);
  return user.mustChangePassword ? passwordChangePath(destination) : destination;
}

export function passwordValidation(current: string, password: string, confirmation: string) {
  if (!current) return "현재 비밀번호를 입력하세요.";
  if (password.length < 12 || password.length > 256) return "새 비밀번호는 12~256자로 입력하세요.";
  if (/change-me|replace-me/i.test(password)) return "기본 비밀번호 패턴을 사용할 수 없습니다.";
  if (password === current) return "현재 비밀번호와 다른 비밀번호를 입력하세요.";
  if (password !== confirmation) return "새 비밀번호 확인이 일치하지 않습니다.";
  return null;
}

export function parseRetryAfter(value: unknown, now = Date.now()): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const seconds = /^\d+$/.test(value) ? Number(value) : (Date.parse(value) - now) / 1000;
  return Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : null;
}

const messages: Record<string, string> = {
  CURRENT_PASSWORD_INCORRECT: "현재 비밀번호가 올바르지 않습니다.",
  EMAIL_UNCHANGED: "현재 주소와 다른 이메일을 입력하세요.",
  INVALID_EMAIL_CODE: "인증코드가 올바르지 않거나 무효화되었습니다. 최신 메일의 코드와 요청 상태를 확인하세요.",
  COMPANY_ACCOUNT_REQUIRED: "이메일 변경은 기업 계정에서만 사용할 수 있습니다.",
  PASSWORD_CHANGE_REQUIRED: "먼저 개인 비밀번호를 설정해 주세요.",
  EMAIL_UNAVAILABLE: "다른 계정에서 사용 중인 이메일입니다. 다른 주소를 입력하세요.",
  EMAIL_CHANGE_EXPIRED: "인증코드가 만료되었습니다. 새 코드를 요청하세요.",
  EMAIL_CHANGE_COOLDOWN: "아직 인증코드를 다시 보낼 수 없습니다. 대기 시간이 지난 후 요청하세요.",
  EMAIL_CHANGE_ATTEMPTS_EXCEEDED: "인증 시도 횟수를 모두 사용했습니다. 새 코드를 요청하세요.",
  EMAIL_VERIFICATION_SEND_FAILED: "인증 메일의 발송 여부를 확인하지 못했습니다. 코드가 도착했다면 인증할 수 있습니다. 도착하지 않았다면 요청 상태를 확인한 뒤 재발급하세요.",
  EMAIL_DISABLED: "서버의 메일 발송 기능이 꺼져 있습니다. 관리자에게 문의해 주세요.",
};
export function accountErrorMessage(error: unknown): string {
  const value = error as { code?: string; status?: number; message?: string } | null;
  if (value?.code && Object.hasOwn(messages, value.code)) return messages[value.code];
  if (value?.status === 429) return "인증 요청이 너무 많습니다. 안내된 대기 시간 후 다시 시도하세요.";
  if (value?.status === 401) return "이메일·비밀번호를 확인하거나 다시 로그인해 주세요.";
  if (value?.message === "Current password is incorrect") return messages.CURRENT_PASSWORD_INCORRECT;
  if (value?.message === "Password must be 12–256 characters and must not use a default password") return "새 비밀번호는 12~256자이며 기본 비밀번호 패턴을 사용할 수 없습니다.";
  return value?.message || "요청을 완료하지 못했습니다. 잠시 후 다시 시도하세요.";
}
