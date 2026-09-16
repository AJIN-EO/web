import { http } from "./client";
import type { DistributionRequest, RequestDetail, RequestSummary } from "../types/api";

export interface CreateEoItemInput {
  vehicle: string;
  eoNo: string;
  itemName: string;
  issueDate: string;
  requirement: string;
  reason: string;
}

export interface CreateDistributionInput {
  title: string;
  message: string | null;
  items: CreateEoItemInput[];
}

export const getAdminRequests = () =>
  http.get<{ requests: RequestSummary[] }>("/api/admin/requests");

export const getAdminRequest = (id: string) =>
  http.get<{ request: RequestDetail }>(`/api/admin/requests/${encodeURIComponent(id)}`);

export const createDistribution = (input: CreateDistributionInput) =>
  http.post<{ request: DistributionRequest }>("/api/requests", input);

export const getCompanyRequests = () =>
  http.get<{ requests: RequestSummary[] }>("/api/company/requests");

export const getCompanyRequest = (publicId: string) =>
  http.get<{ request: RequestDetail }>(
    `/api/company/requests/${encodeURIComponent(publicId)}`,
  );

export const createDownloadUrl = (publicId: string) =>
  http.post<{ downloadUrl: string }>(
    `/api/company/requests/${encodeURIComponent(publicId)}/download`,
  );
