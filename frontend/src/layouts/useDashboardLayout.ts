import type { MenuOption } from "naive-ui";
import { NIcon } from "naive-ui";
import IconDashboard from "@/components/icons/carbon/IconDashboard.vue";
import IconUserAvatar from "@/components/icons/carbon/IconUserAvatar.vue";
import IconGroup from "@/components/icons/carbon/IconGroup.vue";
import IconSettings from "@/components/icons/carbon/IconSettings.vue";
import { useDarkMode } from "@/composables/useDarkMode.ts";

interface BreadcrumbItem {
  label: string;
  routeName?: string;
}

const routeToMenuMap: Record<string, string> = {
  Dashboard: "Dashboard",
  AdminSeats: "AdminSeats",
  AdminUsers: "AdminUsers",
  AdminAdmins: "AdminAdmins",
};

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  Dashboard: [{ label: "Dashboard" }],
  AdminSeats: [{ label: "Seats" }],
  AdminUsers: [{ label: "Users" }],
  AdminAdmins: [{ label: "Admins" }],
};

const useDashboardLayout = () => {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const collapsed = ref(false);

  const renderIcon = (icon: Component) => {
    return () =>
      h(NIcon, {
        component: icon,
      });
  };

  const breadcrumbs = computed(() => {
    const name = route.name as string;
    return breadcrumbMap[name] || [{ label: (route.meta.title as string) || name }];
  });

  const menuOptions = computed<MenuOption[]>(() => [
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: renderIcon(IconDashboard),
    },
    {
      key: "AdminSeats",
      label: "Seats",
      icon: renderIcon(IconSettings),
    },
    {
      key: "AdminUsers",
      label: "Users",
      icon: renderIcon(IconGroup),
    },
    {
      key: "AdminAdmins",
      label: "Admins",
      icon: renderIcon(IconUserAvatar),
    },
  ]);

  const activeKey = computed(() => {
    const currentName = route.name as string;
    return routeToMenuMap[currentName] || currentName;
  });

  const handleMenuClick = async (key: string) => {
    const menuKeyToRoute: Record<string, string> = {
      Dashboard: "Dashboard",
      AdminSeats: "AdminSeats",
      AdminUsers: "AdminUsers",
      AdminAdmins: "AdminAdmins",
    };
    const routeName = menuKeyToRoute[key] || key;
    await router.push({ name: routeName });
  };

  const handleLogout = () => {
    authStore.logout();
  };

  return {
    authStore,
    router,
    collapsed,
    isDark,
    toggleDark,
    breadcrumbs,
    menuOptions,
    activeKey,
    IconUserAvatar,
    handleMenuClick,
    handleLogout,
  };
};

export default useDashboardLayout;
