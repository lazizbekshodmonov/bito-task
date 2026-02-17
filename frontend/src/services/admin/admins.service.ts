import httpClient from "@/utils/http-client.ts";
import type { IUser } from "@/services/user/user.types";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAdminData {
  name?: string;
  email?: string;
}

export const getAdmins = async (params?: PaginationParams & { search?: string }) => {
  const response = await httpClient<PaginatedResponse<IUser>>({
    method: "GET",
    url: "admin",
    params,
  });
  return response.data;
};

export const createAdmin = async (data: CreateAdminData) => {
  const response = await httpClient<IUser>({
    method: "POST",
    url: "admin",
    data,
  });
  return response.data;
};

export const updateAdmin = async (id: number, data: UpdateAdminData) => {
  const response = await httpClient<IUser>({
    method: "PUT",
    url: `admin/${id}`,
    data,
  });
  return response.data;
};

export const changeAdminStatus = async (id: number, status: string) => {
  const response = await httpClient<IUser>({
    method: "PUT",
    url: `admin/change-status/${id}`,
    data: { status },
  });
  return response.data;
};

export const deleteAdmin = async (id: number) => {
  await httpClient({
    method: "DELETE",
    url: `admin/${id}`,
  });
};
