import { http } from "./client";
import type { SessionUser } from "../types/api";

export interface LoginInput {
  email: string;
  password: string;
}

export const login = (input: LoginInput) =>
  http.post<{ user: SessionUser }>("/api/auth/login", input);

export const logout = () => http.post<null>("/api/auth/logout");

export const getMe = () => http.get<{ user: SessionUser }>("/api/me");
