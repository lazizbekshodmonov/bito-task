import { computed } from "vue";
import type { TableDropdownActionProps } from "./table-dropdown-action.types";
import type { DropdownMixedOption } from "naive-ui/lib/dropdown/src/interface";

/**
 * Transforms the raw TableDropdownOption array from props into Naive UI
 * DropdownMixedOption format, mapping onClick handlers to the props object.
 *
 * @param props - The TableDropdownAction component props containing the options array
 * @returns An object containing the computed dropdownOptions for the NDropdown component
 */
export const useTableDropdownAction = (props: TableDropdownActionProps) => {
  const dropdownOptions = computed<DropdownMixedOption[]>(() =>
    props.options.map((item) => ({
      label: item.label,
      key: item.key,
      icon: item.icon,
      type: item.type,
      props: {
        onClick: item.onClick,
      },
    }))
  );

  return { dropdownOptions };
};
