import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { 
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    secondary: { 
      main: "#0ea5e9", // Sky blue
    },
    background: { 
      default: "#0b0f1a", // Even darker, more professional
      paper: "#111827",   // Slate 900
    },
    divider: "rgba(255, 255, 255, 0.05)",
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    }
  },
  shape: {
    borderRadius: 8, // More minimalist than 12
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, letterSpacing: -0.5 },
    h5: { fontWeight: 600, letterSpacing: -0.3 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        size: "small",
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px',
        },
        containedPrimary: {
          backgroundColor: "#3b82f6",
          "&:hover": { backgroundColor: "#2563eb" },
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'none', // Removing heavy shadows for minimalism
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  },
});

export default theme;
