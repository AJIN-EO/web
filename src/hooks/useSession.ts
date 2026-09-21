import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../api/auth";
import { AUTH_UNAUTHORIZED_EVENT, PASSWORD_CHANGE_REQUIRED_EVENT, getApiErrorStatus } from "../api/client";
import { queryKeys } from "../queries/queryKeys";
import type { SessionUser } from "../types/api";

function useSessionCache() {
  const queryClient = useQueryClient();
  const clearSession = useCallback(() => {
    void queryClient.cancelQueries();
    queryClient.setQueryData(queryKeys.session, null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "session" });
  }, [queryClient]);
  const replaceSession = useCallback(async (user: SessionUser) => {
    await queryClient.cancelQueries();
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "session" });
    queryClient.removeQueries({ queryKey: queryKeys.loginNotice, exact: true });
    queryClient.setQueryData(queryKeys.session, user);
  }, [queryClient]);
  return { clearSession, replaceSession };
}

// Install once, instead of once per component using useSession.
export function SessionEvents() {
  const queryClient = useQueryClient();
  const { clearSession } = useSessionCache();
  useEffect(() => {
    const requirePassword = () => {
      void queryClient.cancelQueries();
      queryClient.setQueryData<SessionUser | null>(queryKeys.session, (user) => user ? { ...user, mustChangePassword: true } : user);
      // The guard unmounts protected observers. Removing active queries here can
      // recreate them before that render; replaceSession clears them after the change.
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);
    window.addEventListener(PASSWORD_CHANGE_REQUIRED_EVENT, requirePassword);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);
      window.removeEventListener(PASSWORD_CHANGE_REQUIRED_EVENT, requirePassword);
    };
  }, [clearSession, queryClient]);
  return null;
}

export function useSession() {
  const { clearSession, replaceSession } = useSessionCache();

  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: async ({ signal }) => {
      try {
        return (await authApi.getMe(signal)).user;
      } catch (error) {
        if (getApiErrorStatus(error) === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    gcTime: 0,
    onSuccess: ({ user }) => replaceSession(user),
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: clearSession,
  });

  return {
    user: sessionQuery.data ?? null,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    clearSession,
    replaceSession,
  };
}
