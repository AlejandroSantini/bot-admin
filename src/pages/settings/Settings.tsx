import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import { settingsService, type TenantInfo } from "../../services/settingsService";
import ScheduleTab from "./ScheduleTab";
import PaymentsTab from "./PaymentsTab";
import BlockedDatesTab from "./BlockedDatesTab";
import SystemTab from "./SystemTab";
import ProfileSection from "./ProfileSection";
import NotificationsTab from "./NotificationsTab";
import MetaConnectionTab from "./MetaConnectionTab";
import { CustomPaper } from "../../components/common/CustomPaper";
import { useAuth } from "../../hooks/useAuth";

export default function Settings() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onboardingStep } = useAuth();
  
  // Si estamos en el paso 0, forzamos la pestaña de Meta
  const [activeTab, setActiveTab] = useState(onboardingStep === 0 ? "meta" : "meta");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getMe();
        setTenant(data);
        // Si ya pasó el onboarding pero no tiene reservas, ir a sistema
        if (onboardingStep >= 2 && data.modules_config?.reservas === false) {
           setActiveTab("system");
        } else if (onboardingStep >= 2) {
           setActiveTab("schedule");
        }
      } catch (err) {
        setError("Error al cargar la información del perfil");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [onboardingStep]);

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
  
  const showReservationsConfig = tenant.modules_config?.reservas !== false && onboardingStep >= 2;
  const showFullConfig = onboardingStep >= 2;

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
          {onboardingStep < 2 
            ? "Completa la configuración inicial para activar tu bot." 
            : "Personaliza tu bot y administra las preferencias del sistema."}
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
            {showFullConfig && showReservationsConfig && (
              <Tab label="Horarios" value="schedule" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            {showFullConfig && showReservationsConfig && (
              <Tab label="Pagos y Señas" value="payments" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            {showFullConfig && showReservationsConfig && (
              <Tab label="Bloqueos" value="blocks" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            {showFullConfig && (
              <Tab label="Sistema" value="system" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            {showFullConfig && (
              <Tab label="Notificaciones" value="notifications" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            {showFullConfig && (
              <Tab label="Mi Perfil" value="profile" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
            )}
            <Tab label="Conexión Meta" value="meta" sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {activeTab === "meta" && <MetaConnectionTab />}
          
          {showFullConfig && (
            <>
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
            </>
          )}
        </Box>
      </CustomPaper>
    </Box>
  );
}
