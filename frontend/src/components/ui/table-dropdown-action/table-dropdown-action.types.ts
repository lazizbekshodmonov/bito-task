import type { RendererElement, RendererNode, VNode } from "vue";

export interface TableDropdownOption {
  label: string;
  key: string;
  icon?: () => VNode<RendererNode, RendererElement, { [p: string]: unknown }>;
  type?: string;
  onClick?: () => void;
}

export interface TableDropdownActionProps {
  options: TableDropdownOption[];
}
