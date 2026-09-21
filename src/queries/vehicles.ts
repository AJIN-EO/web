import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createVehicleAlias, createVehicleCompany, deleteVehicleAlias, deleteVehicleCompany, getCompanies, getVehicleAliases, getVehicleCompanies, updateVehicleCompany } from "../api/vehicles";
import { queryKeys } from "./queryKeys";

export function useVehicleCompaniesQuery() {
  return useQuery({ queryKey: queryKeys.vehicleCompanies, queryFn: async () => (await getVehicleCompanies()).mappings });
}
export function useVehicleAliasesQuery() {
  return useQuery({ queryKey: queryKeys.vehicleAliases, queryFn: async () => (await getVehicleAliases()).aliases });
}
export function useCompaniesQuery() {
  return useQuery({ queryKey: ["admin", "companies"], queryFn: async () => (await getCompanies()).companies });
}

type VehicleAction =
  | { type: "addMapping"; vehicle: string; companyCode: string }
  | { type: "updateMapping"; id: string; companyCode: string; expectedVersion: number }
  | { type: "deleteMapping"; id: string; expectedVersion: number }
  | { type: "addAlias"; alias: string; vehicle: string; companyCode: string }
  | { type: "deleteAlias"; id: string };

export function useVehicleActionMutation() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (action: VehicleAction) => {
      switch (action.type) {
        case "addMapping": await createVehicleCompany({ vehicle: action.vehicle, companyCode: action.companyCode }); break;
        case "updateMapping": await updateVehicleCompany(action.id, { companyCode: action.companyCode, expectedVersion: action.expectedVersion }); break;
        case "deleteMapping": await deleteVehicleCompany(action.id, action.expectedVersion); break;
        case "addAlias": await createVehicleAlias({ alias: action.alias, vehicle: action.vehicle, companyCode: action.companyCode }); break;
        case "deleteAlias": await deleteVehicleAlias(action.id); break;
      }
    },
    // A conflict requires a new read and explicit user action, never a write retry.
    onSettled: async () => { await client.invalidateQueries({ queryKey: queryKeys.vehicleSettings }); },
  });
}
