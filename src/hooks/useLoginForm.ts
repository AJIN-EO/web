import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { UserRole } from "../types/api";
import { useSession } from "./useSession";

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const safeNext = safeInternalPath(searchParams.get("next"));

  const submit = async () => {
    if (session.isLoggingIn) return;
    try {
      const { user } = await session.login({ email: email.trim(), password });
      navigate(safeNext ?? landingPath(user.role), { replace: true });
    } catch {
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
    error: session.loginError,
    redirectTo: session.user ? safeNext ?? landingPath(session.user.role) : null,
  };
}

function safeInternalPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

function landingPath(role: UserRole) {
  return role === "admin" ? "/admin" : "/company";
}
