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
  Tooltip,
  useTheme,
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
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Receipt as ReceiptIcon,
  SmartToy as AssistantIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface SidebarItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  configKey?: string;
  minStep?: number;
}

const mainMenuItems: SidebarItem[] = [
  { text: "Asistente", icon: <AssistantIcon sx={{ fontSize: 20 }} />, path: "/asistente", configKey: "asistente", minStep: 1 },
  { text: "Estadísticas", icon: <BarChartIcon sx={{ fontSize: 20 }} />, path: "/estadisticas", configKey: "reservas", minStep: 2 },
  { text: "Reservas", icon: <VentaIcon sx={{ fontSize: 20 }} />, path: "/reservas", configKey: "reservas", minStep: 2 },
  { text: "Clientes", icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: "/clientes", configKey: "clientes", minStep: 2 },
  { text: "Servicios", icon: <InventoryIcon sx={{ fontSize: 20 }} />, path: "/servicios", configKey: "servicios", minStep: 2 },
  { text: "Productos", icon: <ProductoIcon sx={{ fontSize: 20 }} />, path: "/productos", configKey: "productos", minStep: 2 },
  { text: "Campañas", icon: <CampaignIcon sx={{ fontSize: 20 }} />, path: "/campanas", configKey: "campanas", minStep: 2 },
  { text: "Facturación", icon: <ReceiptIcon sx={{ fontSize: 20 }} />, path: "/facturacion", configKey: "facturacion", minStep: 2 },
];

const bottomMenuItems: SidebarItem[] = [
  { text: "Configuración", icon: <SettingsIcon sx={{ fontSize: 20 }} />, path: "/configuracion", minStep: 0 },
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
  const drawerWidth = 240;
  const collapsedWidth = 64;
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { logout, modulesConfig, onboardingStep, user } = useAuth();

  const itemButtonSx = (isLocked: boolean) => ({
    mx: 1,
    my: 0.2,
    borderRadius: 1.5,
    minHeight: 40,
    px: 1.5,
    opacity: isLocked ? 0.7 : 1,
    color: isLocked ? 'text.disabled' : 'text.primary',
    '&.Mui-selected': {
      backgroundColor: 'action.selected',
      color: 'primary.main',
      '& .MuiListItemIcon-root': { color: 'primary.main' },
      '&:hover': { backgroundColor: 'action.selected' },
    },
    '&:hover': {
      backgroundColor: isLocked ? 'transparent' : 'action.hover',
    },
  });

  const showText = isMobile || !collapsed;

  const renderItem = (item: SidebarItem) => {
    const isHidden = modulesConfig && item.configKey && modulesConfig[item.configKey] === false;
    if (isHidden) return null;

    // Si el módulo está habilitado explícitamente en la configuración, no está bloqueado
    // Esto permite que tenants antiguos vean sus módulos sin pasar por el nuevo onboarding
    const isExplicitlyEnabled = modulesConfig && item.configKey && modulesConfig[item.configKey] === true;
    
    // Fail-safe para tenants antiguos que no tienen modulesConfig poblado
    const hasEmptyModules = !modulesConfig || Object.keys(modulesConfig).length === 0;
    const isOldTenantFallback = hasEmptyModules && onboardingStep >= 1;

    const isLocked = false; // Removiendo candados por pedido del usuario

    const itemContent = (
      <ListItemButton
        key={item.text}
        selected={selectedItem === item.path}
        disabled={isLocked}
        onClick={() => !isLocked && onItemClick?.(item.path)}
        sx={itemButtonSx(isLocked)}
      >
        <ListItemIcon sx={{ 
          minWidth: 32, 
          color: "inherit",
        }}>
          {item.icon}
        </ListItemIcon>
        {showText && (
          <ListItemText 
            primary={item.text} 
            sx={{ 
              "& .MuiListItemText-primary": { 
                fontSize: "0.85rem", 
                fontWeight: selectedItem === item.path ? 600 : 400,
              } 
            }} 
          />

        )}
      </ListItemButton>
    );

    return itemContent;
  };

  const drawerContent = (
    <Box sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: "background.paper",
      borderRight: "1px solid",
      borderColor: "divider",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "5px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(155, 155, 155, 0.2)",
        borderRadius: "10px",
      },
      "&:hover::-webkit-scrollbar-thumb": {
        background: "rgba(155, 155, 155, 0.4)",
      }
    }}>
      <Toolbar sx={{ px: 2, minHeight: 64, display: "flex", justifyContent: showText ? "space-between" : "center" }}>
        {showText && (
          <Typography 
            variant="h6" 
            sx={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: 0.8,
              color: mode === 'dark' ? '#fff' : 'primary.main',
              letterSpacing: '-0.02em'
            }}
          >
            <span className="tino-font" style={{ fontSize: '1.8rem' }}>tino</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.6 }}>admin</span>
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={onToggle} size="small" sx={{ color: "text.secondary" }}>
            {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Toolbar>
      
      <List sx={{ pt: 1, px: 0.5, flexGrow: 1 }}>
        {mainMenuItems.map(renderItem)}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      <List sx={{ px: 0.5, py: 1 }}>
        {bottomMenuItems.map(renderItem)}
      </List>

      {/* User Info Section */}
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minHeight: 60
      }}>
        <Box sx={{ 
          width: 32, 
          height: 32, 
          borderRadius: "50%", 
          background: "linear-gradient(135deg, #0b8185 0%, #1f5f61 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "white",
          fontWeight: 700,
          fontSize: "0.8rem",
          boxShadow: "0 4px 12px rgba(11, 129, 133, 0.3)"
        }}>
          {user?.name?.charAt(0).toUpperCase() || "B"}
        </Box>
        {showText && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || (
                <Box component="span" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <span className="tino-font" style={{ color: mode === 'dark' ? '#fff' : 'primary.main', fontSize: '1.1rem' }}>tino</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 500 }}>admin</span>
                </Box>
              )}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email || user?.phone || "Conectado"}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton
          onClick={logout}
          sx={{ borderRadius: 1.5, minHeight: 40, px: 1.5, color: "text.secondary" }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          {showText && <ListItemText primary="Salir" sx={{ "& .MuiListItemText-primary": { fontSize: "0.85rem" } }} />}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onMobileClose}
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : drawerWidth,
          border: "none",
          transition: "width 0.2s ease",
          overflowX: "hidden",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
