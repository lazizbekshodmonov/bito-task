import httpClient from "@/utils/http-client.ts";
import { IUser } from "@/services/user/user.types.ts";

export const getProfile = async () => {
  const response = await httpClient<IUser>({
    method: "GET",
    url: "user/profile",
  });

  return response.data;
};
