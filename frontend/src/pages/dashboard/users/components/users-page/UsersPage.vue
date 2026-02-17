<script setup lang="ts">
  import useUsersPage from "./useUsersPage";

  const {
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
  } = useUsersPage();
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
      <n-button type="primary" @click="showCreateModal = true">Create User</n-button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <n-input
        v-model:value="search"
        placeholder="Search users..."
        clearable
        style="max-width: 300px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
    </div>

    <n-data-table
      :columns="columns"
      :data="users"
      :loading="isLoading"
      :bordered="false"
      striped
    />

    <div v-if="totalPages > 1" class="mt-4 flex justify-end">
      <n-pagination :page="page" :page-count="totalPages" @update:page="handlePageChange" />
    </div>

    <!-- Create Modal -->
    <n-modal
      v-model:show="showCreateModal"
      preset="dialog"
      title="Create User"
      :show-icon="false"
    >
      <n-form class="mt-4">
        <n-form-item label="Name">
          <n-input v-model:value="createForm.name" placeholder="Full name" />
        </n-form-item>
        <n-form-item label="Email">
          <n-input v-model:value="createForm.email" placeholder="Email address" />
        </n-form-item>
        <n-form-item label="Password">
          <n-input v-model:value="createForm.password" placeholder="Password" type="password" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showCreateModal = false">Cancel</n-button>
        <n-button type="primary" :loading="formLoading" @click="handleCreate">Create</n-button>
      </template>
    </n-modal>

    <!-- Edit Modal -->
    <n-modal
      v-model:show="showEditModal"
      preset="dialog"
      title="Edit User"
      :show-icon="false"
    >
      <n-form class="mt-4">
        <n-form-item label="Name">
          <n-input v-model:value="editForm.name" placeholder="Full name" />
        </n-form-item>
        <n-form-item label="Email">
          <n-input v-model:value="editForm.email" placeholder="Email address" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showEditModal = false">Cancel</n-button>
        <n-button type="primary" :loading="formLoading" @click="handleEdit">Save</n-button>
      </template>
    </n-modal>
  </div>
</template>
