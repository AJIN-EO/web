import { http } from "./client";
import type { DistributionRequest, RequestDetail, RequestSummary } from "../types/api";

export interface CreateEoItemInput {
  vehicles: string[];
  eoNo: string;
  itemName: string;
  issueDate: string;
  requirement: string;
  reason: string;
}

export interface CreateDistributionInput {
  title?: string;
  message?: string;
  items: CreateEoItemInput[];
}

export type DistributionNotification = {
  status: "sent" | "failed" | "skipped";
  messageId?: string;
  stage?: string;
  errorCode?: string;
  error?: string;
  reason?: "email_disabled" | "no_recipients";
  trackingError?: boolean;
};

export interface RoutedDistribution {
  company: {
    id: string;
    code: string;
    name: string;
  };
  itemIndices: number[];
  vehicle: string;
  itemRefs: Array<{ itemIndex: number; vehicleIndex: number; vehicle: string }>;
  request: DistributionRequest;
  notification: DistributionNotification;
}

export interface CreateDistributionResponse {
  distributions: RoutedDistribution[];
  warnings: unknown[];
}

export interface DistributionRoutingIssue {
  itemIndex: number;
  vehicleIndex: number;
  vehicle: string;
  eoNo: string;
  code: "EO_NOT_FOUND" | "COMPANY_NOT_FOUND" | "AMBIGUOUS_COMPANY"
    | "VEHICLE_COMPANY_NOT_CONFIGURED" | "VEHICLE_NOT_FOUND"
    | "PART_PATH_INVALID" | (string & {});
  message: string;
}

export const getAdminRequests = () =>
  http.get<{ requests: RequestSummary[] }>("/api/admin/requests");

export const getAdminRequest = (id: string) =>
  http.get<{ request: RequestDetail }>(`/api/admin/requests/${encodeURIComponent(id)}`);

export const createDistribution = (input: CreateDistributionInput) =>
  http.post<CreateDistributionResponse>("/api/requests", input);

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
