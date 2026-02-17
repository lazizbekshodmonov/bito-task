import httpClient from "@/utils/http-client.ts";
import type { IUser } from "@/services/user/user.types";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export const getUsers = async (params?: PaginationParams & { search?: string }) => {
  const response = await httpClient<PaginatedResponse<IUser>>({
    method: "GET",
    url: "user",
    params,
  });
  return response.data;
};

export const createUser = async (data: CreateUserData) => {
  const response = await httpClient<IUser>({
    method: "POST",
    url: "user",
    data,
  });
  return response.data;
};

export const updateUser = async (id: number, data: UpdateUserData) => {
  const response = await httpClient<IUser>({
    method: "PUT",
    url: `user/${id}`,
    data,
  });
  return response.data;
};

export const changeUserStatus = async (id: number, status: string) => {
  const response = await httpClient<IUser>({
    method: "PUT",
    url: `user/change-status/${id}`,
    data: { status },
  });
  return response.data;
};

export const deleteUser = async (id: number) => {
  await httpClient({
    method: "DELETE",
    url: `user/${id}`,
  });
};
