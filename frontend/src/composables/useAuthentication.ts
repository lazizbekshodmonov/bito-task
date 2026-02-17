import { handleError } from "@/utils/handleError.ts";
import { AxiosError } from "axios";
import { IBaseException } from "@/types/exception.ts";
import { getProfile } from "@/services/user/user.service.ts";
import useAuthStore from "@/stores/auth.store.ts";

export const useAuthentication = () => {
  const authStore = useAuthStore();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const user = await getProfile();
      authStore.setUserData(user);
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    }
  };

  return {
    checkAuth,
  };
};
