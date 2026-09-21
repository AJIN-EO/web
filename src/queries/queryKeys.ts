export const queryKeys = {
  session: ["session"] as const,
  loginNotice: ["session", "login-notice"] as const,
  vehicleSettings: ["admin", "vehicle-settings"] as const,
  vehicleCompanies: ["admin", "vehicle-settings", "companies"] as const,
  vehicleAliases: ["admin", "vehicle-settings", "aliases"] as const,
  adminRequests: ["admin", "requests"] as const,
  adminRequest: (id: string) => ["admin", "requests", id] as const,
  companyRequests: ["company", "requests"] as const,
  companyRequest: (publicId: string) => ["company", "requests", publicId] as const,
  companyPackageStatus: (publicId: string) => ["company", "package-status", publicId] as const,
  discussion: (publicId: string, itemId: string) =>
    ["requests", publicId, "items", itemId, "discussion"] as const,
};
