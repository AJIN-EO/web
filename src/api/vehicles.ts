import { http } from "./client";
import type { Company } from "../types/api";
import type { VehicleAlias, VehicleCompany } from "../types/vehicles";

export const getCompanies = () => http.get<{ companies: Company[] }>("/api/companies");
export const getVehicleCompanies = () => http.get<{ mappings: VehicleCompany[] }>("/api/admin/vehicle-companies");
export const createVehicleCompany = (input: { vehicle: string; companyCode: string }) =>
  http.post<{ mapping: VehicleCompany }>("/api/admin/vehicle-companies", input);
export const updateVehicleCompany = (id: string, input: { companyCode: string; expectedVersion: number }) =>
  http.patch<{ mapping: VehicleCompany }>(`/api/admin/vehicle-companies/${encodeURIComponent(id)}`, input);
export const deleteVehicleCompany = (id: string, expectedVersion: number) =>
  http.delete(`/api/admin/vehicle-companies/${encodeURIComponent(id)}`, { expectedVersion });

export const getVehicleAliases = () => http.get<{ aliases: VehicleAlias[] }>("/api/admin/vehicle-aliases");
export const createVehicleAlias = (input: { alias: string; companyCode: string; vehicle: string }) =>
  http.post<{ alias: Pick<VehicleAlias, "id" | "alias" | "vehicle"> }>("/api/admin/vehicle-aliases", input);
export const deleteVehicleAlias = (id: string) => http.delete(`/api/admin/vehicle-aliases/${encodeURIComponent(id)}`);
