import { ref } from "vue";
import { adminLogin } from "@/services/auth/auth.service.ts";
import { getProfile } from "@/services/user/user.service.ts";
import { handleError } from "@/utils/handleError.ts";
import type { AxiosError } from "axios";
import type { IBaseException } from "@/types/exception.ts";

const useAdminLoginPage = () => {
  const router = useRouter();
  const authStore = useAuthStore();

  const email = ref("");
  const password = ref("");
  const loading = ref(false);

  const handleLogin = async () => {
    if (!email.value || !password.value) return;
    loading.value = true;
    try {
      const tokens = await adminLogin({ email: email.value, password: password.value });
      authStore.setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await getProfile();
      authStore.setUserData(profile);
      await router.push({ name: "Dashboard" });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    } finally {
      loading.value = false;
    }
  };

  return {
    email,
    password,
    loading,
    handleLogin,
  };
};

export default useAdminLoginPage;
