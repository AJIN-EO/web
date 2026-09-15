import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../api/auth";
import { AUTH_UNAUTHORIZED_EVENT, getApiErrorStatus } from "../api/client";
import { queryKeys } from "../queries/queryKeys";

export function useSession() {
  const queryClient = useQueryClient();
  const clearSession = useCallback(() => {
    queryClient.setQueryData(queryKeys.session, null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "session" });
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);
  }, [clearSession]);

  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      try {
        return (await authApi.getMe()).user;
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
    onSuccess: ({ user }) => queryClient.setQueryData(queryKeys.session, user),
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
  };
}
