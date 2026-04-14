import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Box,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  PointOfSale as VentaIcon,
  ChevronLeft,
  ChevronRight,
  ExitToApp as LogoutIcon,
  ShoppingBag as ProductoIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

interface SidebarItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  configKey?: string;
}

const menuItems: SidebarItem[] = [
  { text: "Reservas", icon: <VentaIcon />, path: "/reservas", configKey: "reservas" },
  { text: "Clientes", icon: <PeopleIcon />, path: "/clientes", configKey: "clientes" },
  { text: "Servicios", icon: <InventoryIcon />, path: "/servicios", configKey: "servicios" },
  { text: "Productos", icon: <ProductoIcon />, path: "/productos", configKey: "productos" },
  { text: "Campañas", icon: <CampaignIcon />, path: "/campanas", configKey: "campanas" },
];

interface SidebarProps {
  selectedItem?: string;
  onItemClick?: (path: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  selectedItem,
  onItemClick,
  collapsed,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const drawerWidth = 210;
  const collapsedWidth = 64;
  const { logout, modulesConfig } = useAuth();

  const handleLogout = () => {
    logout();
  };


  const visibleMenuItems = menuItems.filter(item => {
    if (!modulesConfig || !item.configKey) return true;
    return modulesConfig[item.configKey] !== false;
  });

  const itemButtonSx = (itemPath: string) => ({
    mx: 1,
    borderRadius: 2,
    minHeight: 48,
    justifyContent: isMobile ? "flex-start" : collapsed ? "center" : "flex-start",
    px: 2,
    transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
    "&.Mui-selected": {
      backgroundColor: "#ccccccff",
      "&:hover": { backgroundColor: "#f5f5f5" },
    },
  });

  const itemIconSx = (itemPath: string) => ({
    color: selectedItem === itemPath ? "primary.main" : "text.secondary",
    minWidth: 40,
    width: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: isMobile ? "flex-start" : collapsed ? "center" : "flex-start",
    mr: 0,
    transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
  });

  const showText = isMobile || !collapsed;

  const itemTextSx = {
    opacity: showText ? 1 : 0,
    maxWidth: showText ? 160 : 0,
    minWidth: 0,
    ml: 0,
    transition: "opacity 0.3s, max-width 0.3s cubic-bezier(.4,0,.2,1)",
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
    "& .MuiListItemText-primary": {
      fontWeight: 400,
      fontSize: "0.85rem",
    },
  };

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: showText ? "space-between" : "center",
          px: 0,
          minHeight: 64,
          height: 64,
          width: "100%",
        }}
      >
        {showText && (
          <Typography
            variant="h6"
            sx={{
              ml: 2,
              fontWeight: 700,
              color: "primary.main",
              whiteSpace: "nowrap",
            }}
          >
            Bot Admin
          </Typography>
        )}
        {!isMobile && (
          <Box
            sx={{
              minWidth: 32,
              display: "flex",
              justifyContent: "right",
              alignItems: "center",
              flex: 1,
            }}
          >
            <IconButton onClick={onToggle} size="small">
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1, pb: 8 }}>
        {visibleMenuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={selectedItem === item.path}
            onClick={() => onItemClick?.(item.path)}
            sx={itemButtonSx(item.path)}
          >
            <ListItemIcon sx={itemIconSx(item.path)}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={itemTextSx} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ position: "absolute", bottom: 0, width: "100%", mb: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            mx: 1,
            borderRadius: 2,
            minHeight: 48,
            justifyContent: showText ? "flex-start" : "center",
            px: 2,
            mb: 0.5,
            transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <ListItemIcon
            sx={{
              color: "text.secondary",
              minWidth: 40,
              width: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: showText ? "flex-start" : "center",
              mr: 0,
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary={showText ? "Cerrar sesión" : ""}
            sx={itemTextSx}
          />
        </ListItemButton>
      </Box>
    </>
  );

  // Mobile: temporary overlay drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop: permanent collapsible drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: "hidden",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
