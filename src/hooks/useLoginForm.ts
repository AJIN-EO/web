import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "./useSession";
import { safeNextPath, sessionDestination } from "../utils/account";
import { useRetryCooldown } from "./useRetryCooldown";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queries/queryKeys";

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = useSession();
  const location = useLocation();
  const client = useQueryClient();
  const [notice] = useState(() => (location.state as { email?: string; notice?: string; next?: string } | null)
    ?? client.getQueryData<{ email?: string; notice?: string; next?: string }>(queryKeys.loginNotice));
  const [email, setEmail] = useState(notice?.email ?? "");
  const [password, setPassword] = useState("");
  const safeNext = safeNextPath(notice?.next ?? searchParams.get("next"));
  const cooldown = useRetryCooldown();

  const submit = async () => {
    if (session.isLoggingIn || cooldown.seconds) return;
    try {
      const { user } = await session.login({ email: email.trim(), password });
      setPassword("");
      navigate(sessionDestination(user, safeNext), { replace: true });
    } catch (error) {
      cooldown.record(error);
      // useSession exposes the login error to the form.
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    submit,
    isLoading: session.isLoading,
    isSubmitting: session.isLoggingIn,
    retrySeconds: cooldown.seconds,
    notice: notice?.notice ?? (safeNext === "/account/email" ? "이메일 인증 확인 중 세션이 종료됐다면 새 이메일과 기존 비밀번호로 로그인해 변경 결과를 확인하세요." : null),
    error: session.loginError ?? session.error,
    redirectTo: session.user ? sessionDestination(session.user, safeNext) : null,
  };
}
