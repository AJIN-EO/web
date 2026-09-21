export interface VehicleAlias {
  id: string;
  alias: string;
  company_code: string;
  vehicle: string;
  created_by_id: string;
  created_at: string;
}

export interface VehicleCompany {
  id: string;
  vehicle: string;
  company_id: string;
  company_code: string;
  company_name: string;
  company_is_active: boolean;
  version: number;
  created_by_id: string;
  updated_by_id: string;
  created_at: string;
  updated_at: string;
}
