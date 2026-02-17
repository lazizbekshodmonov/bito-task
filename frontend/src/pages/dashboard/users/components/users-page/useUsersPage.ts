import { ref, h } from "vue";
import { NSwitch, NButton, NSpace } from "naive-ui";
import type { DataTableColumns } from "naive-ui";
import { getUsers, createUser, updateUser, changeUserStatus, deleteUser } from "@/services/admin/users.service.ts";
import type { CreateUserData, UpdateUserData } from "@/services/admin/users.service.ts";
import type { IUser } from "@/services/user/user.types";
import { handleError } from "@/utils/handleError.ts";
import { message } from "@/utils/discrete.ts";
import type { AxiosError } from "axios";
import type { IBaseException } from "@/types/exception.ts";

const useUsersPage = () => {
  const queryClient = useQueryClient();
  const route = useRoute();
  const router = useRouter();

  const search = ref((route.query.search as string) || "");
  const page = ref(Number(route.query.page) || 1);
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const editingUser = ref<IUser | null>(null);
  const formLoading = ref(false);

  const createForm = ref<CreateUserData>({ name: "", email: "", password: "" });
  const editForm = ref<UpdateUserData>({ name: "", email: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search] as const,
    queryFn: () => getUsers({ page: page.value, size: 10, search: search.value || undefined }),
    placeholderData: (prev) => prev,
  });

  const users = computed(() => data.value?.content || []);
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
      await createUser(createForm.value);
      message?.success("User created");
      showCreateModal.value = false;
      createForm.value = { name: "", email: "", password: "" };
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    } finally {
      formLoading.value = false;
    }
  };

  const openEdit = (user: IUser) => {
    editingUser.value = user;
    editForm.value = { name: user.name, email: user.email };
    showEditModal.value = true;
  };

  const handleEdit = async () => {
    if (!editingUser.value) return;
    formLoading.value = true;
    try {
      await updateUser(editingUser.value.id, editForm.value);
      message?.success("User updated");
      showEditModal.value = false;
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    } finally {
      formLoading.value = false;
    }
  };

  const handleStatusToggle = async (user: IUser) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await changeUserStatus(user.id, newStatus);
      message?.success(`User ${newStatus.toLowerCase()}`);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    }
  };

  const handleDelete = async (user: IUser) => {
    try {
      await deleteUser(user.id);
      message?.success("User deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
    users,
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

export default useUsersPage;
