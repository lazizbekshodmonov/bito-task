import { AxiosError } from "axios";
import { IBaseException } from "@/types/exception.ts";
import { message } from "@/utils/discrete.ts";

/**
 * Handles Axios errors by displaying user-friendly error messages via Naive UI notifications.
 * Silently ignores 401 authentication errors and session expiration errors.
 * Formats validation errors with field-level details when available.
 *
 * @param err - The Axios error object containing the backend exception response
 * @returns void
 */
export const handleError = (err: AxiosError<IBaseException>) => {
  if (err.response?.status === 401 || err.response?.data.code === "AUTH_TOKEN_INVALID_OR_EXPIRED" || err.code === "AUTH_SESSION_EXPIRED") return;
  if (err.response?.data.message) {
    if (err.response.data.code === "VALIDATION_ERROR") {
      let msg = `${err.response.data.message}\n`;

      msg += err.response.data.details?.map((item) => item.errors.map((e) => `${item.field} - ${e}`).join("\n")).join("\n");

      message?.error(msg);
    } else {
      message?.error(err.response.data.message);
    }
  } else {
    message?.error(err.message);
  }
};
