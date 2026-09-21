import { http } from "./client";
import type { SessionUser } from "../types/api";

export interface LoginInput {
  email: string;
  password: string;
}

export const login = (input: LoginInput) =>
  http.post<{ user: SessionUser }>("/api/auth/login", input);

export const logout = () => http.post<null>("/api/auth/logout");

export const getMe = (signal?: AbortSignal) => http.get<{ user: SessionUser }>("/api/me", { signal });

export const changePassword = (input: { currentPassword: string; newPassword: string }) =>
  http.post<{ user: SessionUser }>("/api/auth/change-password", input);

export interface EmailChange {
  challengeId: string;
  newEmail: string;
  expiresAt: string;
  resendAvailableAt: string;
  attemptsRemaining: number;
}
export const getEmailChange = (signal?: AbortSignal) => http.get<{ change: EmailChange | null }>("/api/me/email-change", { signal });
export const requestEmailChange = (input: { currentPassword: string; newEmail: string }) =>
  http.post<{ change: EmailChange }>("/api/me/email-change", input);
export const confirmEmailChange = (input: { challengeId: string; code: string }) =>
  http.post<{ user: SessionUser; reauthenticationRequired: true }>("/api/me/email-change/confirm", input);
