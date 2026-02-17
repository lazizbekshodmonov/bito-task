import { useDarkMode } from "@/composables/useDarkMode.ts";

const useClientLayout = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const handleLogout = () => {
    authStore.logout();
  };

  const goToSeats = () => {
    router.push({ path: "/seats" });
  };

  const goToReservations = () => {
    router.push({ path: "/reservations" });
  };

  return {
    authStore,
    router,
    isDark,
    toggleDark,
    handleLogout,
    goToSeats,
    goToReservations,
  };
};

export default useClientLayout;
