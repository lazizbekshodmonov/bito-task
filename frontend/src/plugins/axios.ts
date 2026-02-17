import axios from "axios";

// ================== AXIOS INSTANCE ==================
export const axiosPlugin = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 60000,
});

// ================== REFRESH STATE ==================
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export const ensureTokenRefreshed = (): Promise<void> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  const refreshToken = localStorage.getItem("refreshToken");

  refreshPromise = axios
    .post(`${import.meta.env.VITE_API_BASE}/api/v1/auth/refresh`, null, {
      headers: { "X-Refresh-Token": refreshToken || "" },
    })
    .then((res) => {
      const { accessToken, refreshToken: newRefreshToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

// ================== REQUEST INTERCEPTOR ==================
axiosPlugin.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosPlugin;
