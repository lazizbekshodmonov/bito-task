import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { IUser, UserRole } from "@/services/user/user.types.ts";
import { getProfile } from "@/services/user/user.service.ts";

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const route = useRoute();
  const queryClient = useQueryClient();
  const user = ref<IUser | null>(null);
  const isAuthenticated = ref(false);
  const isLogout = ref(false);

  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);
  const isUser = computed(() => user.value?.role === UserRole.USER);

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const setUserData = (userRes: IUser) => {
    user.value = userRes;
    isAuthenticated.value = true;
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const profile = await getProfile();
    setUserData(profile);
  };

  const logout = async () => {
    user.value = null;
    isAuthenticated.value = false;
    isLogout.value = true;
    clearTokens();
    await queryClient.invalidateQueries();

    try {
      await router.push({
        name: "Login",
        query: {
          redirect: route.fullPath !== "/auth/login" ? route.fullPath : undefined,
        },
      });
    } catch {
      // Ignore navigation failures
    }
  };

  return {
    user,
    isLogout,
    isAuthenticated,
    isAdmin,
    isUser,
    setTokens,
    clearTokens,
    setUserData,
    checkAuth,
    logout,
  };
});

export default useAuthStore;
