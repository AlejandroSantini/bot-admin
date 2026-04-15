import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { useThemeMode } from "../../providers/ThemeModeProvider";

interface TopBarProps {
  title?: string;
  drawerWidth?: number;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export default function TopBar({
  title = "Panel Admin",
  drawerWidth = 210,
  isMobile = false,
  onMenuClick,
}: TopBarProps) {
  const { mode, toggleColorMode } = useThemeMode();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
        backgroundColor: "background.paper",
        color: "text.primary",
        boxShadow: (theme) => theme.palette.mode === 'light' ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s cubic-bezier(.4,0,.2,1), margin-left 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          {title}
        </Typography>
        <Box>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}