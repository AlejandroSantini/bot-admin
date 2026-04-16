import React, { useState, useEffect } from "react";
import { useThemeMode } from "../../providers/ThemeModeProvider";
import {
  Box,
  Typography,
  Switch,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  NotificationImportant as CancelIcon,
  NotificationsActive as RemindersIcon,
} from "@mui/icons-material";
import { settingsService } from "../../services/settingsService";
import type { ModulesConfig, ReminderConfig } from "../../services/settingsService";
import { ContainedButton } from "../../components/common/ContainedButton";

interface SystemTabProps {
  initialReminders?: ReminderConfig | null;
  initialModulesConfig?: ModulesConfig | null;
  showReservations?: boolean;
}

export default function SystemTab({ 
  initialReminders, 
  initialModulesConfig,
  showReservations = false
}: SystemTabProps) {
  const { mode, toggleColorMode } = useThemeMode();

  // Track which reminders are active
  const [activeReminders, setActiveReminders] = useState<Record<string, boolean>>({
    "1h": false, "24h": false, "48h": false
  });

  const fixedValues: Record<string, number> = {
    "1h": 60,
    "24h": 1440,
    "48h": 2880,
  };

  const [modulesConfig, setModulesConfig] = useState<ModulesConfig>({
    cancellation_notice_enabled: initialModulesConfig?.cancellation_notice_enabled || false,
  });
  
  const [saving, setSaving] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialReminders) {
      const active: Record<string, boolean> = {};
      Object.keys(fixedValues).forEach(key => {
        active[key] = !!initialReminders[key];
      });
      setActiveReminders(active);
    }
  }, [initialReminders]);

  useEffect(() => {
    if (initialModulesConfig) {
      setModulesConfig({
        ...initialModulesConfig,
        cancellation_notice_enabled: initialModulesConfig.cancellation_notice_enabled || false,
      });
    }
  }, [initialModulesConfig]);

  const handleToggleReminder = (key: string) => {
    setActiveReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveReminders = async () => {
    try {
      setSaving(true);
      setError(null);
      const config: ReminderConfig = {};
      Object.keys(activeReminders).forEach(key => {
        if (activeReminders[key]) config[key] = fixedValues[key];
      });
      await settingsService.updateReminders({ reminder_config: config });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError("Error al guardar los recordatorios");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleModule = async (field: keyof ModulesConfig, value: boolean) => {
    try {
      setSavingModule(true);
      const newConfig = { ...modulesConfig, [field]: value };
      setModulesConfig(newConfig);
      await settingsService.updateModulesConfig({ modules_config: newConfig });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al actualizar la configuración del módulo");
    } finally {
      setSavingModule(false);
    }
  };

  const reminderLabels: Record<string, string> = { "1h": "1 Hora Antes", "24h": "24 Horas Antes", "48h": "48 Horas Antes" };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Configuración actualizada correctamente</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <DarkModeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">Apariencia</Typography>
            </Box>
            <Box sx={{ 
              flexGrow: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="body2" fontWeight="600">Modo Oscuro</Typography>
                <Typography variant="caption" color="text.secondary">Cambia el tema visual</Typography>
              </Box>
              <Switch 
                checked={mode === 'dark'} 
                onChange={toggleColorMode} 
                color="primary"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        {showReservations && (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <CancelIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="600">Notificaciones</Typography>
              </Box>
              <Box sx={{ 
                flexGrow: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="body2" fontWeight="600">Aviso de cancelación</Typography>
                  <Typography variant="caption" color="text.secondary">Informa al usuario</Typography>
                </Box>
                <Switch
                  checked={modulesConfig.cancellation_notice_enabled}
                  onChange={(e) => handleToggleModule("cancellation_notice_enabled", e.target.checked)}
                  color="primary"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {showReservations && (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <RemindersIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="600">Recordatorios de WhatsApp</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {Object.keys(reminderLabels).map((key) => (
                  <Box key={key} sx={{ 
                    p: 1.5, bgcolor: 'action.hover', borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: '1px solid', borderColor: activeReminders[key] ? 'primary.main' : 'transparent'
                  }}>
                    <Box>
                      <Typography variant="body2" fontWeight="600">{reminderLabels[key]}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Aviso automático por WhatsApp
                      </Typography>
                    </Box>
                    <Switch size="small" checked={activeReminders[key]} onChange={() => handleToggleReminder(key)} />
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                <ContainedButton onClick={handleSaveReminders} disabled={saving}>
                  {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                </ContainedButton>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
