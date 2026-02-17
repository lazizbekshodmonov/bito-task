import { GlobalThemeOverrides } from "naive-ui";

const shared: GlobalThemeOverrides = {
  common: {
    primaryColor: "#000000",
    primaryColorHover: "#333333",
    primaryColorPressed: "#333333",
  },

  Menu: {
    itemHeight: "48px",
    borderRadius: "12px",

    itemColorActive: "#000000",
    itemTextColorActive: "#ffffff",
    itemIconColorActive: "#ffffff",

    itemTextColorHover: "#ffffff",
    itemIconColorHover: "#ffffff",
    itemColorHover: "#444444",

    itemColorActiveHover: "#000000",
    itemTextColorActiveHover: "#ffffff",
    itemIconColorActiveHover: "#ffffff",

    itemColorActiveCollapsed: "#000000",
    itemTextColorActiveCollapsed: "#ffffff",
    itemIconColorActiveCollapsed: "#ffffff",
    itemTextColorCollapsed: undefined,
    itemIconColorCollapsed: undefined,
    itemColorHoverCollapsed: "#444444",
    itemTextColorHoverCollapsed: "#ffffff",
    itemIconColorHoverCollapsed: "#ffffff",
    itemColorActiveHoverCollapsed: "#000000",
    itemTextColorActiveHoverCollapsed: "#ffffff",
    itemIconColorActiveHoverCollapsed: "#ffffff",
  },

  Button: {
    borderRadiusLarge: "12px",
    borderRadiusMedium: "10px",
    borderRadiusSmall: "8px",

    colorPrimary: "#000000",
    colorHoverPrimary: "#222222",
    colorPressedPrimary: "#333333",
    colorFocusPrimary: "#333333",

    opacityDisabled: "0.4",

    textColorPrimary: "#ffffff",
    textColorHoverPrimary: "#ffffff",
    textColorPressedPrimary: "#ffffff",
    textColorFocusPrimary: "#ffffff",

    heightLarge: "42px",
    paddingLarge: "12px 28px",
  },
  Switch: {
    railColorActive: "#24c90b",
    railColor: "#ea0808",
  },
  Dialog: {
    borderRadius: "14px",
    iconColorWarning: "#ea0808",
  },
  Pagination: {
    itemBorderRadius: "8px",
  },
  Card: {
    borderRadius: "14px",
  },
  Input: {
    borderRadius: "12px",
    heightLarge: "42px",
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: "12px",
        heightLarge: "42px",
      },
    },
  },
  Tag: {
    borderRadius: "12px",
    padding: "8px 16px",
  },
  Alert: {
    borderRadius: "12px",
  },
};

export const lightThemeOverrides: GlobalThemeOverrides = {
  ...shared,
  common: {
    ...shared.common,
    hoverColor: "#ffffff",
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  ...shared,
  common: {
    ...shared.common,
    primaryColor: "#ffffff",
    primaryColorHover: "#e0e0e0",
    primaryColorPressed: "#cccccc",
  },
  Menu: {
    ...shared.Menu,
    itemColorActive: "#ffffff",
    itemTextColorActive: "#000000",
    itemIconColorActive: "#000000",
    itemColorHover: "#888888",
    itemColorActiveHover: "#ffffff",
    itemTextColorActiveHover: "#000000",
    itemIconColorActiveHover: "#000000",
    itemColorActiveCollapsed: "#ffffff",
    itemTextColorActiveCollapsed: "#000000",
    itemIconColorActiveCollapsed: "#000000",
    itemColorHoverCollapsed: "#888888",
    itemColorActiveHoverCollapsed: "#ffffff",
    itemTextColorActiveHoverCollapsed: "#000000",
    itemIconColorActiveHoverCollapsed: "#000000",
  },
  Button: {
    ...shared.Button,
    colorPrimary: "#ffffff",
    colorHoverPrimary: "#e0e0e0",
    colorPressedPrimary: "#cccccc",
    colorFocusPrimary: "#cccccc",
    textColorPrimary: "#000000",
    textColorHoverPrimary: "#000000",
    textColorPressedPrimary: "#000000",
    textColorFocusPrimary: "#000000",
  },
};
