import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import useAuthStore from "@/stores/auth.store";
import { useAuthentication } from "@/composables/useAuthentication.ts";

export default async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const auth = useAuthStore();
  const { checkAuth } = useAuthentication();

  if (!auth.isAuthenticated && !auth.isLogout) {
    await checkAuth();
  }

  if (!auth.isAuthenticated) {
    return next({ name: "Login" });
  }

  return next();
};
