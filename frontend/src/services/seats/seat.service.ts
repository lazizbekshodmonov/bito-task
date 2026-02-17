import httpClient from "@/utils/http-client.ts";
import type { ISeat } from "./seat.types";

export const getAllSeats = async () => {
  const response = await httpClient<ISeat[]>({
    method: "GET",
    url: "seats",
  });
  return response.data;
};
