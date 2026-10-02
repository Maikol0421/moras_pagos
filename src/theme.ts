import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4F46E5",
      light: "#818CF8",
      dark: "#3730A3",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#DB2777",
      light: "#F472B6",
      dark: "#9D174D",
      contrastText: "#FFFFFF",
    },
    success: { main: "#16A34A", light: "#86EFAC", dark: "#15803D" },
    warning: { main: "#D97706", light: "#FCD34D", dark: "#B45309" },
    error: { main: "#DC2626", light: "#FCA5A5", dark: "#B91C1C" },
    background: { default: "#F4F5FA", paper: "#FFFFFF" },
    text: { primary: "#1E1B2E", secondary: "#5B5770" },
    divider: "rgba(30, 27, 46, 0.08)",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 10, paddingTop: 9, paddingBottom: 9 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)",
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "none", borderBottom: "1px solid rgba(30,27,46,0.08)" },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiBottomNavigationAction: {
      styleOverrides: { root: { minWidth: 0, paddingLeft: 4, paddingRight: 4 } },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiFormControl: {
      defaultProps: { size: "small" },
    },
  },
});
