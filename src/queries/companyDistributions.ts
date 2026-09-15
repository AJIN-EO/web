import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createDownloadUrl,
  getCompanyRequest,
  getCompanyRequests,
} from "../api/distributions";
import { queryKeys } from "./queryKeys";
import { hasProcessingPackage, packageListPollingInterval } from "./packagePolling";

export function useCompanyRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.companyRequests,
    queryFn: async () => (await getCompanyRequests()).requests,
    enabled,
    refetchInterval: (query) => packageListPollingInterval(query.state.data),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) => hasProcessingPackage(query.state.data),
    refetchOnReconnect: (query) => hasProcessingPackage(query.state.data),
    staleTime: (query) => hasProcessingPackage(query.state.data) ? 0 : Infinity,
  });
}

export function useCompanyRequestQuery(publicId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companyRequest(publicId ?? ""),
    queryFn: async () => (await getCompanyRequest(publicId!)).request,
    enabled: Boolean(publicId),
    // The server records every company detail GET as a visit.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
}

export function useDownloadDistributionMutation(publicId: string) {
  return useMutation({
    mutationFn: () => createDownloadUrl(publicId),
  });
}
