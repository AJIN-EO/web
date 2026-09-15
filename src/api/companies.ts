import { http } from "./client";
import type { Company } from "../types/api";

export const getCompanies = () => http.get<{ companies: Company[] }>("/api/companies");
