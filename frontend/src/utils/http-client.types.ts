import type { AxiosRequestConfig } from "axios";

export interface ApiRequest extends AxiosRequestConfig {
  open?: boolean;
  version?: number;
  prefix?: string;
}
