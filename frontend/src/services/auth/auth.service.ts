import type { LoginCredentials, RegisterData, TokensResponse } from "./auth.types";
import httpClient from "@/utils/http-client.ts";

export const login = async (credentials: LoginCredentials) => {
  const response = await httpClient<TokensResponse>({
    url: "auth/login",
    method: "POST",
    data: credentials,
  });
  return response.data;
};

export const adminLogin = async (credentials: LoginCredentials) => {
  const response = await httpClient<TokensResponse>({
    url: "auth/admin-login",
    method: "POST",
    data: credentials,
  });
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await httpClient<{ message: string }>({
    url: "auth/register",
    method: "POST",
    data,
  });
  return response.data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  const response = await httpClient<TokensResponse>({
    url: "auth/refresh",
    method: "POST",
    headers: { "X-Refresh-Token": refresh || "" },
  });
  return response.data;
};
