// Mirrors server/src/db.js. node-postgres returns bigserial values as strings,
// while publicUser() converts session user IDs to numbers.
export type UserRole = "admin" | "staff" | "company";
export type PackageStatus = "pending" | "processing" | "ready" | "failed";

export interface SessionUser {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: number | null;
}

export interface Company {
  id: string;
  code: string;
  name: string;
  search_root_template: string;
  is_active: boolean;
  created_at: string;
}

export interface DistributionRequest {
  id: string;
  public_id: string;
  company_id: string;
  created_by_id: string;
  title: string;
  message: string | null;
  package_status: PackageStatus;
  package_s3_key: string | null;
  package_filename: string | null;
  error_message: string | null;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestSummary extends DistributionRequest {
  company_code: string;
  company_name: string;
  item_count: number;
  visit_count?: number;
  download_count?: number;
}

export interface EoItem {
  id: string;
  request_id: string;
  vehicle: string;
  eo_no: string;
  item_name: string;
  issue_date: string | null;
  requirement: string | null;
  reason: string | null;
}

export interface SearchResult {
  id: string;
  request_id: string;
  eo_no: string;
  nas_path: string;
  created_at: string;
}

export interface VisitLog {
  id: string;
  request_id: string;
  user_id: string;
  ip_address: string;
  user_agent: string | null;
  visited_at: string;
}

export interface DownloadLog {
  id: string;
  request_id: string;
  user_id: string;
  ip_address: string;
  downloaded_at: string;
}

export interface RequestDetail extends DistributionRequest {
  company_code: string;
  company_name: string;
  search_root_template: string;
  items: EoItem[];
  search_results: SearchResult[];
  visits: VisitLog[];
  downloads: DownloadLog[];
}
