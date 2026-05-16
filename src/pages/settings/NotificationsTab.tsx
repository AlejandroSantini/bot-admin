import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import { NotificationsActive as RemindersIcon } from "@mui/icons-material";
import { settingsService } from "../../services/settingsService";
import type { ReminderConfig } from "../../services/settingsService";
import { ContainedButton } from "../../components/common/ContainedButton";

interface NotificationsTabProps {
  initialReminders?: ReminderConfig | null;
  showReservations?: boolean;
}

export default function NotificationsTab({
  initialReminders,
  showReservations = false,
}: NotificationsTabProps) {
  // Track which reminders are active
  const [activeReminders, setActiveReminders] = useState<Record<string, boolean>>({
    "1h": false,
    "24h": false,
  });

  const fixedValues: Record<string, number> = {
    "1h": 60,
    "24h": 1440,
  };

  const [adminNotifications, setAdminNotifications] = useState({
    CREAR: false,
    EDITAR: false,
    ELIMINAR: false,
  });

  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState<boolean | null>(null);

  const [saving, setSaving] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await settingsService.getConfig();
        const config = data?.data || data?.config || data;

        if (config?.admin_notifications) {
          setAdminNotifications({
            CREAR: !!config.admin_notifications.CREAR,
            EDITAR: !!config.admin_notifications.EDITAR,
            ELIMINAR: !!config.admin_notifications.ELIMINAR,
          });
        }
        if (config?.calendar_sync_enabled !== undefined) {
          setCalendarSyncEnabled(!!config.calendar_sync_enabled);
        }
      } catch (err) {
        console.error("Error al cargar la configuración de avisos", err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (initialReminders) {
      const active: Record<string, boolean> = {};
      Object.keys(fixedValues).forEach((key) => {
        active[key] = !!initialReminders[key];
      });
      setActiveReminders(active);
    }
  }, [initialReminders]);

  const handleToggleReminder = (key: string) => {
    setActiveReminders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleAdminNotification = (
    key: "CREAR" | "EDITAR" | "ELIMINAR",
    value: boolean
  ) => {
    setAdminNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleCalendarSync = (value: boolean) => {
    setCalendarSyncEnabled(value);
  };

  const handleSaveCalendarSync = async () => {
    try {
      setSavingCalendar(true);
      setError(null);
      await settingsService.updateConfig({
        config: {
          calendar_sync_enabled: !!calendarSyncEnabled,
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al guardar la configuración de Google Calendar");
    } finally {
      setSavingCalendar(false);
    }
  };

  const handleSaveAdminNotifications = async () => {
    try {
      setSavingAdmin(true);
      setError(null);
      await settingsService.updateConfig({
        config: {
          admin_notifications: adminNotifications,
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al guardar la configuración de avisos");
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleSaveReminders = async () => {
    try {
      setSaving(true);
      setError(null);
      const config: ReminderConfig = {};
      Object.keys(activeReminders).forEach((key) => {
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

  const reminderLabels: Record<string, string> = {
    "1h": "1 Hora Antes",
    "24h": "24 Horas Antes",
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Configuración actualizada correctamente
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {showReservations && (
          <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <RemindersIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="600">
                  Recordatorios de WhatsApp
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {Object.keys(reminderLabels).map((key) => (
                  <Box
                    key={key}
                    sx={{
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid",
                      borderColor: activeReminders[key]
                        ? "primary.main"
                        : "transparent",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {reminderLabels[key]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Aviso automático por WhatsApp
                      </Typography>
                    </Box>
                    <Switch
                      size="small"
                      checked={activeReminders[key]}
                      onChange={() => handleToggleReminder(key)}
                    />
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  mt: 3,
                  pt: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <ContainedButton onClick={handleSaveReminders} disabled={saving}>
                  {saving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Guardar"
                  )}
                </ContainedButton>
              </Box>
            </CardContent>
          </Card>
        )}

        <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <RemindersIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">
                Avisos automáticos desde el Admin
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                {
                  key: "CREAR",
                  label: "Al Crear",
                  desc: "Avisar por WhatsApp al cliente cuando se crea una reserva manualmente.",
                },
                {
                  key: "EDITAR",
                  label: "Al Editar",
                  desc: "Avisar por WhatsApp al cliente cuando se edita una reserva manualmente.",
                },
                {
                  key: "ELIMINAR",
                  label: "Al Eliminar",
                  desc: "Avisar por WhatsApp al cliente cuando se elimina una reserva manualmente.",
                },
              ].map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    p: 1.5,
                    bgcolor: "action.hover",
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid",
                    borderColor: adminNotifications[
                      item.key as "CREAR" | "EDITAR" | "ELIMINAR"
                    ]
                      ? "primary.main"
                      : "transparent",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={
                      adminNotifications[
                        item.key as "CREAR" | "EDITAR" | "ELIMINAR"
                      ]
                    }
                    onChange={(e) =>
                      handleToggleAdminNotification(
                        item.key as "CREAR" | "EDITAR" | "ELIMINAR",
                        e.target.checked
                      )
                    }
                  />
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                mt: 3,
                pt: 1,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <ContainedButton
                onClick={handleSaveAdminNotifications}
                disabled={savingAdmin}
              >
                {savingAdmin ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Guardar"
                )}
              </ContainedButton>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <RemindersIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">
                Google Calendar
              </Typography>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="600">
                  Sincronización manual
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Habilita la sincronización desde Google Calendar
                </Typography>
              </Box>
              <Switch
                checked={!!calendarSyncEnabled}
                onChange={(e) => handleToggleCalendarSync(e.target.checked)}
                color="primary"
                size="small"
              />
            </Box>

            <Box
              sx={{
                mt: 3,
                pt: 1,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <ContainedButton
                onClick={handleSaveCalendarSync}
                disabled={savingCalendar}
              >
                {savingCalendar ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Guardar"
                )}
              </ContainedButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
