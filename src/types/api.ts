// Mirrors server/src/db.js. node-postgres returns bigserial values as strings,
// while publicUser() converts session user IDs to numbers.
export type UserRole = "admin" | "company";
export type PackageStatus = "pending" | "processing" | "ready" | "failed";
export type DiscussionStatus = "active" | "modified" | "not_required";
export type DiscussionEventType = "comment" | "resolved" | "reopened";

export interface SessionUser {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: number | null;
  mustChangePassword: boolean;
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
  issued_at: string | null;
  issue_date_precision: "date" | "datetime" | null;
  requirement: string | null;
  reason: string | null;
  nas_search_root: string | null;
  nas_matches: Array<{ name: string; path: string; isDir: boolean }> | null;
  carryover_sync_id?: string | null;
  recipient_vehicles?: string[] | null;
  nas_sources?: NasSource[] | null;
  discussion_status: DiscussionStatus;
  discussion_version: number;
  resolution_reason: string | null;
  resolved_by_id: string | null;
  resolved_at: string | null;
  discussion_updated_at: string;
}

export interface NasSource {
  path: string;
  name: string;
  isDir: boolean;
  root: string;
  sourceCompany: string;
  sourceVehicle: string;
  partNo: string;
  recipientVehicles: string[];
}

export interface Discussion {
  item_id: string;
  status: DiscussionStatus;
  version: number;
  resolution_reason: string | null;
  resolved_by_id: string | null;
  resolved_at: string | null;
  updated_at: string;
}

export interface DiscussionEvent {
  id: string;
  eo_item_id: string;
  version: number;
  type: DiscussionEventType;
  body: string | null;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  from_status: DiscussionStatus;
  to_status: DiscussionStatus;
  created_at: string;
}

export interface DiscussionPage {
  discussion: Discussion;
  events: DiscussionEvent[];
  nextAfterVersion: number;
  hasMore: boolean;
}

export interface DiscussionHistory {
  discussion: Discussion;
  events: DiscussionEvent[];
}

export interface DiscussionChangeResult {
  discussion: Discussion;
  event: DiscussionEvent;
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
