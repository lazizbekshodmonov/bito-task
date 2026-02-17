import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiRequest } from "@/utils/http-client.types";
import { axiosPlugin, ensureTokenRefreshed } from "@/plugins/axios";
import { IBaseException } from "@/types/exception.ts";

const buildUrl = ({ prefix = "/api", version = 1, url }: Pick<ApiRequest, "prefix" | "version" | "url">) => {
  let fullUrl = url || "";
  if (version) fullUrl = `v${version}/${fullUrl}`;
  if (prefix) fullUrl = `${prefix}/${fullUrl}`;
  return fullUrl;
};

const httpClient = async <T = unknown>({ prefix = "/api", version = 1, open = false, url, ...config }: ApiRequest): Promise<AxiosResponse<T>> => {
  const fullUrl = buildUrl({ prefix, version, url });

  const requestConfig: AxiosRequestConfig = {
    ...config,
    url: fullUrl,
  };

  if (open) {
    requestConfig.headers = { ...requestConfig.headers };
  }

  try {
    return await axiosPlugin.request<T>(requestConfig);
  } catch (error) {
    const axiosError = error as AxiosError<IBaseException>;

    if (axiosError.response?.status === 401) {
      await ensureTokenRefreshed();
      return await axiosPlugin.request<T>(requestConfig);
    }

    throw error;
  }
};

export default httpClient;
