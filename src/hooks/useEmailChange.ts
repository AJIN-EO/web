import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { confirmEmailChange, getEmailChange, requestEmailChange, type EmailChange } from "../api/auth";
import { ApiError } from "../api/client";
import { useSession } from "./useSession";
import { useNow, useRetryCooldown } from "./useRetryCooldown";
import { queryKeys } from "../queries/queryKeys";
import { isValidEmail } from "../utils/account";

export function useEmailChange() {
  const session = useSession();
  const navigate = useNavigate();
  const client = useQueryClient();
  const queryKey = ["account", session.user?.id, "email-change"] as const;
  const query = useQuery({
    queryKey, queryFn: async ({ signal }) => (await getEmailChange(signal)).change,
    enabled: session.user?.role === "company" && !session.user.mustChangePassword,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<"request" | "confirm" | null>(null);
  const inFlight = useRef(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState("");
  const now = useNow();
  const requestCooldown = useRetryCooldown();
  const authCooldown = useRetryCooldown();
  const change = query.data;
  useEffect(() => {
    setCode("");
    if (change) setNewEmail(change.newEmail);
  }, [change?.challengeId]); // Restore or replace the server-issued challenge, never a locally stored code.

  const resendSeconds = Math.max(requestCooldown.seconds, change ? Math.ceil((Date.parse(change.resendAvailableAt) - now) / 1000) : 0, 0);
  const expiresSeconds = change ? Math.max(0, Math.ceil((Date.parse(change.expiresAt) - now) / 1000)) : 0;
  const busy = Boolean(pending) || query.isFetching;
  const blocked = busy || query.isPending || query.isError || authCooldown.seconds > 0;
  const canRequest = !blocked && resendSeconds === 0 && Boolean(currentPassword) && newEmail.trim().toLowerCase() !== session.user?.email.toLowerCase() && isValidEmail(newEmail);
  const canConfirm = !blocked && Boolean(change && expiresSeconds > 0 && change.attemptsRemaining > 0 && /^\d{6}$/.test(code));

  const recover = async (failure: unknown) => {
    setError(failure);
    if (failure instanceof ApiError) {
      if (failure.code === "EMAIL_CHANGE_COOLDOWN") requestCooldown.record(failure);
      else authCooldown.record(failure);
      if (failure.status === 401 || failure.status === 403) return;
      const details = (failure.data as { details?: { change?: EmailChange } } | null)?.details;
      if (details?.change) {
        client.setQueryData(queryKey, details.change);
        return;
      }
    }
    // Read the authoritative attempt count/challenge after any uncertain write; never resend automatically.
    await query.refetch();
  };
  const request = async () => {
    if (!canRequest || inFlight.current) return;
    inFlight.current = true; setPending("request"); setError(null); setNotice("");
    try {
      const { change: next } = await requestEmailChange({ currentPassword, newEmail: newEmail.trim().toLowerCase() });
      client.setQueryData(queryKey, next);
      setCode("");
      setNotice("인증 메일 발송이 접수되었습니다. 새 주소의 메일함에서 최신 코드를 확인하세요.");
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 0) setNotice("발송 응답을 받지 못했습니다. 아래에 복원된 요청과 도착한 코드가 있다면 인증할 수 있습니다. 메일이 없으면 대기 시간 후 다시 요청하세요.");
      await recover(failure);
    }
    finally { setCurrentPassword(""); inFlight.current = false; setPending(null); }
  };
  const confirm = async () => {
    if (!canConfirm || !change || inFlight.current) return;
    inFlight.current = true; setPending("confirm"); setError(null); setNotice("");
    try {
      const result = await confirmEmailChange({ challengeId: change.challengeId, code });
      setCode(""); setCurrentPassword("");
      const notice = {
        email: result.user.email,
        next: "/company",
        notice: "이메일이 변경되었습니다. 새 이메일과 기존 비밀번호로 다시 로그인하세요. 다음 EO 메일을 받으면 그 메일에 안내된 임시 비밀번호로 로그인해야 합니다.",
      };
      // The route guard can redirect immediately when the session is cleared.
      // Keep only the non-secret login notice in memory so that redirect cannot discard it.
      client.setQueryData(queryKeys.loginNotice, notice);
      session.clearSession();
      navigate("/login", { replace: true, state: notice });
    } catch (failure) {
      if (failure instanceof ApiError && [0, 401].includes(failure.status)) client.setQueryData(queryKeys.loginNotice, {
        email: change.newEmail,
        notice: "이메일 변경 확인 응답을 받지 못했습니다. 새 이메일과 기존 비밀번호로 로그인해 결과를 확인하세요. 변경되지 않았다면 기존 이메일을 사용하세요.",
      });
      await recover(failure);
      if (failure instanceof ApiError && failure.status === 401) navigate("/login", { replace: true, state: { email: change.newEmail, notice: "세션이 종료되었습니다. 이메일 변경 확인 응답을 받지 못했다면 새 이메일과 기존 비밀번호로 로그인해 결과를 확인하세요." } });
    } finally { inFlight.current = false; setPending(null); }
  };
  return { query, change, newEmail, setNewEmail, currentPassword, setCurrentPassword, code, setCode,
    pending, busy, error, notice, resendSeconds, expiresSeconds, retrySeconds: authCooldown.seconds,
    canRequest, canConfirm, request, confirm };
}
