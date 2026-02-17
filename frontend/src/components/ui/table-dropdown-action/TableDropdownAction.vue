<script setup lang="ts">
  /**
   * TableDropdownAction
   *
   * @description A reusable dropdown action button for table rows. Renders a vertical
   *   dots icon button that opens a dropdown menu with configurable action items.
   *   Commonly used in data tables to provide row-level actions (edit, delete, etc.).
   *
   * @props
   *   - options: Array of TableDropdownOption items defining the dropdown menu entries
   *
   * @emits
   *   - None
   *
   * @usage
   *   <TableDropdownAction :options="[{ label: 'Edit', key: 'edit', onClick: handleEdit }]" />
   */
  import type { TableDropdownActionProps } from "./table-dropdown-action.types";
  import { useTableDropdownAction } from "./useTableDropdownAction";

  const props = defineProps<TableDropdownActionProps>();

  const { dropdownOptions } = useTableDropdownAction(props);
</script>

<template>
  <n-dropdown trigger="click" :options="dropdownOptions">
    <n-button quaternary circle type="info">
      <template #icon>
        <icon-dots-vertical />
      </template>
    </n-button>
  </n-dropdown>
</template>
