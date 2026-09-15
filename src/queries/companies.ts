import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "../api/companies";
import { queryKeys } from "./queryKeys";

export function useCompaniesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => (await getCompanies()).companies,
    enabled,
  });
}
