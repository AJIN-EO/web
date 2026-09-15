import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDistribution,
  getAdminRequest,
  getAdminRequests,
  type CreateDistributionInput,
} from "../api/distributions";
import { queryKeys } from "./queryKeys";
import {
  hasProcessingPackage,
  isPackageProcessing,
  packageListPollingInterval,
  packagePollingInterval,
} from "./packagePolling";

export function useAdminRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.adminRequests,
    queryFn: async () => (await getAdminRequests()).requests,
    enabled,
    refetchInterval: (query) => packageListPollingInterval(query.state.data),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) => hasProcessingPackage(query.state.data),
    refetchOnReconnect: (query) => hasProcessingPackage(query.state.data),
    staleTime: (query) => hasProcessingPackage(query.state.data) ? 0 : Infinity,
  });
}

export function useAdminRequestQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.adminRequest(id ?? ""),
    queryFn: async () => (await getAdminRequest(id!)).request,
    enabled: Boolean(id),
    refetchInterval: (query) => packagePollingInterval(query.state.data?.package_status),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) => isPackageProcessing(query.state.data?.package_status),
    refetchOnReconnect: (query) => isPackageProcessing(query.state.data?.package_status),
    staleTime: (query) => isPackageProcessing(query.state.data?.package_status) ? 0 : Infinity,
  });
}

export function useCreateDistributionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDistributionInput) => createDistribution(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminRequests });
    },
  });
}
