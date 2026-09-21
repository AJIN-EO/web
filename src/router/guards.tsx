import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getApiErrorStatus } from "../api/client";
import { useSession } from "../hooks/useSession";
import type { UserRole } from "../types/api";
import { errorMessage } from "../utils/format";
import { passwordChangePath, safeNextPath } from "../utils/account";

export function RequireSession({ children, allowPasswordChange = false }: { children: ReactNode; allowPasswordChange?: boolean }) {
  const location = useLocation();
  const { user, isLoading, error } = useSession();

  if (isLoading) return <div className="page-state">세션 확인 중...</div>;
  if (!user && (!error || getApiErrorStatus(error) === 401)) {
    const next = allowPasswordChange ? safeNextPath(new URLSearchParams(location.search).get("next")) ?? "/" : `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  if (error) return <div className="alert alert--error">서버에 연결하지 못했습니다: {errorMessage(error)}</div>;
  if (user?.mustChangePassword && !allowPasswordChange) {
    return <Navigate to={passwordChangePath(`${location.pathname}${location.search}${location.hash}`)} replace />;
  }
  return children;
}

export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user } = useSession();
  if (!user || !roles.includes(user.role)) return <Navigate to="/company" replace />;
  return children;
}

export function LandingRedirect() {
  const { user } = useSession();
  return <Navigate to={user?.role === "admin" ? "/admin" : "/company"} replace />;
}
