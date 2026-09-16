export const queryKeys = {
  session: ["session"] as const,
  adminRequests: ["admin", "requests"] as const,
  adminRequest: (id: string) => ["admin", "requests", id] as const,
  companyRequests: ["company", "requests"] as const,
  companyRequest: (publicId: string) => ["company", "requests", publicId] as const,
  discussion: (publicId: string, itemId: string) =>
    ["requests", publicId, "items", itemId, "discussion"] as const,
};
