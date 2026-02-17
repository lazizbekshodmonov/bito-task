import { GlobalThemeOverrides } from "naive-ui";

const shared: GlobalThemeOverrides = {
  common: {
    primaryColor: "#0F398A",
    primaryColorHover: "#0F398A",
    primaryColorPressed: "#0F398A",
  },

  Menu: {
    itemHeight: "48px",
    borderRadius: "12px",

    itemColorActive: "#0F398A",
    itemTextColorActive: "#ffffff",
    itemIconColorActive: "#ffffff",

    itemTextColorHover: "#ffffff",
    itemIconColorHover: "#ffffff",
    itemColorHover: "#6a8ff1",

    itemColorActiveHover: "#0F398A",
    itemTextColorActiveHover: "#ffffff",
    itemIconColorActiveHover: "#ffffff",

    itemColorActiveCollapsed: "#0F398A",
    itemTextColorActiveCollapsed: "#ffffff",
    itemIconColorActiveCollapsed: "#ffffff",
    itemTextColorCollapsed: undefined,
    itemIconColorCollapsed: undefined,
    itemColorHoverCollapsed: "#6a8ff1",
    itemTextColorHoverCollapsed: "#ffffff",
    itemIconColorHoverCollapsed: "#ffffff",
    itemColorActiveHoverCollapsed: "#0F398A",
    itemTextColorActiveHoverCollapsed: "#ffffff",
    itemIconColorActiveHoverCollapsed: "#ffffff",
  },

  Button: {
    borderRadiusLarge: "12px",
    borderRadiusMedium: "10px",
    borderRadiusSmall: "8px",

    colorPrimary: "#0F398A",
    colorHoverPrimary: "#0b2b68",
    colorPressedPrimary: "#0d337d",
    colorFocusPrimary: "#0d337d",

    opacityDisabled: "0",

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
    primaryColor: "#4B7BE5",
    primaryColorHover: "#5A88E8",
    primaryColorPressed: "#3A6AD4",
  },
  Menu: {
    ...shared.Menu,
    itemColorActive: "#4B7BE5",
    itemColorHover: "#3A5BA0",
    itemColorActiveHover: "#4B7BE5",
    itemColorActiveCollapsed: "#4B7BE5",
    itemColorHoverCollapsed: "#3A5BA0",
    itemColorActiveHoverCollapsed: "#4B7BE5",
  },
  Button: {
    ...shared.Button,
    colorPrimary: "#4B7BE5",
    colorHoverPrimary: "#3A6AD4",
    colorPressedPrimary: "#2F5FC0",
    colorFocusPrimary: "#2F5FC0",
  },
};
