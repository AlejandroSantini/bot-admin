import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useState } from "react";

const drawerWidth = 240;
const collapsedWidth = 64;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const path = location.pathname;
  const mainPath = "/" + path.split("/")[1];
  const selectedMenuItem = path === mainPath ? path : mainPath;

  const SECTION_LABELS: Record<string, string> = {
    "/":            "Estadísticas",
    "/estadisticas":"Estadísticas",
    "/reservas":    "Reservas",
    "/clientes":    "Clientes",
    "/servicios":   "Servicios",
    "/productos":   "Productos",
    "/configuracion": "Configuración",
  };
  const pageTitle = SECTION_LABELS[mainPath] ?? "Panel Admin";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuItemClick = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    if (isMobile) setMobileOpen(false);
  };

  const sidebarWidth = isMobile ? 0 : collapsed ? collapsedWidth : drawerWidth;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        selectedItem={selectedMenuItem}
        onItemClick={handleMenuItemClick}
        collapsed={collapsed}
        onToggle={() => {
          if (isMobile) {
            setMobileOpen((prev) => !prev);
          } else {
            setCollapsed((prev) => !prev);
          }
        }}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box sx={{ flexGrow: 1, width: { xs: "100%", md: `calc(100% - ${sidebarWidth}px)` }, maxWidth: "100vw", overflowX: "hidden" }}>
        {isMobile && (
          <>
            <TopBar
              title={pageTitle}
              drawerWidth={sidebarWidth}
              isMobile={isMobile}
              onMenuClick={() => setMobileOpen(true)}
            />
            <Toolbar />
          </>
        )}
        <Box
          component="main"
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            backgroundColor: "background.default",
            minHeight: "calc(100vh - 64px)",
            maxWidth: "100%",
            overflowX: "hidden",
            boxSizing: "border-box"
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
