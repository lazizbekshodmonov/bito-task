import { NIcon } from "naive-ui";
import { h, Component } from "vue";

/**
 * Creates a render function that wraps a given icon component inside Naive UI's NIcon wrapper.
 * Used for rendering icons in Naive UI menu items, buttons, and other components.
 *
 * @param icon - The Vue component to render as an icon
 * @param props - Optional props to pass to the NIcon wrapper component
 * @returns A render function that produces the wrapped icon VNode
 */
export const renderIcon = (icon: Component, props?: Record<string, unknown>) => {
  return () => {
    return h(NIcon, props, {
      default: () => h(icon),
    });
  };
};
