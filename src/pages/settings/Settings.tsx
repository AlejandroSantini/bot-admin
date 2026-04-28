import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import { settingsService, type TenantInfo } from "../../services/settingsService";
import ScheduleTab from "./ScheduleTab";
import PaymentsTab from "./PaymentsTab";
import BlockedDatesTab from "./BlockedDatesTab";
import SystemTab from "./SystemTab";
import ProfileSection from "./ProfileSection";
import NotificationsTab from "./NotificationsTab";
import { CustomPaper } from "../../components/common/CustomPaper";

export default function Settings() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getMe();
        setTenant(data);
        if (data.modules_config?.reservas === false) {
          setActiveTab("system");
        }
      } catch (err) {
        setError("Error al cargar la información del perfil");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tenant) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || "No se pudo cargar la configuración."}</Alert>
      </Box>
    );
  }
  
  const showReservationsConfig = tenant.modules_config?.reservas !== false;

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        mx: "auto",
        p: { xs: 1, sm: 2 },
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Configuración
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Personaliza tu bot y administra las preferencias del sistema.
        </Typography>
      </Box>

      <CustomPaper sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 3 }, pt: 1 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {showReservationsConfig && (
              <Tab label="Horarios" value="schedule" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            {showReservationsConfig && (
              <Tab label="Pagos y Señas" value="payments" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            {showReservationsConfig && (
              <Tab label="Bloqueos" value="blocks" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            <Tab label="Sistema" value="system" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            <Tab label="Notificaciones" value="notifications" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            <Tab label="Mi Perfil" value="profile" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {activeTab === "schedule" && showReservationsConfig && <ScheduleTab />}
          {activeTab === "payments" && showReservationsConfig && <PaymentsTab />}
          {activeTab === "blocks" && showReservationsConfig && <BlockedDatesTab />}
          {activeTab === "system" && (
            <SystemTab 
              initialReminders={tenant.reminder_config} 
              initialModulesConfig={tenant.modules_config}
              showReservations={showReservationsConfig}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationsTab 
              initialReminders={tenant.reminder_config} 
              showReservations={showReservationsConfig}
            />
          )}
          {activeTab === "profile" && <ProfileSection tenant={tenant} />}
        </Box>
      </CustomPaper>
    </Box>
  );
}
