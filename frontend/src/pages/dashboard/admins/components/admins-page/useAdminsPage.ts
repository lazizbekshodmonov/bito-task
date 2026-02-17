import { ref, h } from "vue";
import { NSwitch, NButton, NSpace } from "naive-ui";
import type { DataTableColumns } from "naive-ui";
import { getAdmins, createAdmin, updateAdmin, changeAdminStatus, deleteAdmin } from "@/services/admin/admins.service.ts";
import type { CreateAdminData, UpdateAdminData } from "@/services/admin/admins.service.ts";
import type { IUser } from "@/services/user/user.types";
import { handleError } from "@/utils/handleError.ts";
import { message } from "@/utils/discrete.ts";
import type { AxiosError } from "axios";
import type { IBaseException } from "@/types/exception.ts";

const useAdminsPage = () => {
  const queryClient = useQueryClient();
  const route = useRoute();
  const router = useRouter();

  const search = ref((route.query.search as string) || "");
  const page = ref(Number(route.query.page) || 1);
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const editingAdmin = ref<IUser | null>(null);
  const formLoading = ref(false);

  const createForm = ref<CreateAdminData>({ name: "", email: "", password: "" });
  const editForm = ref<UpdateAdminData>({ name: "", email: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-admins", page, search] as const,
    queryFn: () => getAdmins({ page: page.value, size: 10, search: search.value || undefined }),
    placeholderData: (prev) => prev,
  });

  const admins = computed(() => data.value?.content || []);
  const totalPages = computed(() => data.value?.totalPages || 0);

  const handleSearch = () => {
    page.value = 1;
    router.replace({ query: { ...route.query, search: search.value || undefined, page: undefined } });
  };

  const handlePageChange = (p: number) => {
    page.value = p;
    router.replace({ query: { ...route.query, page: p > 1 ? String(p) : undefined } });
  };

  const handleCreate = async () => {
    formLoading.value = true;
    try {
      await createAdmin(createForm.value);
      message?.success("Admin created");
      showCreateModal.value = false;
      createForm.value = { name: "", email: "", password: "" };
      await queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    } finally {
      formLoading.value = false;
    }
  };

  const openEdit = (admin: IUser) => {
    editingAdmin.value = admin;
    editForm.value = { name: admin.name, email: admin.email };
    showEditModal.value = true;
  };

  const handleEdit = async () => {
    if (!editingAdmin.value) return;
    formLoading.value = true;
    try {
      await updateAdmin(editingAdmin.value.id, editForm.value);
      message?.success("Admin updated");
      showEditModal.value = false;
      await queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    } finally {
      formLoading.value = false;
    }
  };

  const handleStatusToggle = async (admin: IUser) => {
    const newStatus = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await changeAdminStatus(admin.id, newStatus);
      message?.success(`Admin ${newStatus.toLowerCase()}`);
      await queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    }
  };

  const handleDelete = async (admin: IUser) => {
    try {
      await deleteAdmin(admin.id);
      message?.success("Admin deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    }
  };

  const columns: DataTableColumns<IUser> = [
    { title: "Name", key: "name", ellipsis: { tooltip: true } },
    { title: "Email", key: "email", ellipsis: { tooltip: true } },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (row) =>
        h(NSwitch, {
          value: row.status === "ACTIVE",
          onUpdateValue: () => handleStatusToggle(row),
          round: false,
        }),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (row) =>
        h(NSpace, { size: 8 }, {
          default: () => [
            h(NButton, { size: "small", type: "info", ghost: true, onClick: () => openEdit(row) }, { default: () => "Edit" }),
            h(NButton, { size: "small", type: "error", ghost: true, onClick: () => handleDelete(row) }, { default: () => "Delete" }),
          ],
        }),
    },
  ];

  return {
    search,
    page,
    admins,
    totalPages,
    isLoading,
    columns,
    showCreateModal,
    showEditModal,
    createForm,
    editForm,
    formLoading,
    handleSearch,
    handlePageChange,
    handleCreate,
    handleEdit,
  };
};

export default useAdminsPage;
