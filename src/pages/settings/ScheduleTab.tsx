import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { settingsService } from "../../services/settingsService";
import type { ScheduleConfig } from "../../services/settingsService";
import { Input } from "../../components/common/Input";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { CustomPaper } from "../../components/common/CustomPaper";

const DAYS = [
  { id: "1", name: "Lunes" },
  { id: "2", name: "Martes" },
  { id: "3", name: "Miércoles" },
  { id: "4", name: "Jueves" },
  { id: "5", name: "Viernes" },
  { id: "6", name: "Sábado" },
  { id: "0", name: "Domingo" },
];

export default function ScheduleTab() {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const resp = await settingsService.getSchedule();
      setConfig(resp.data || {});
    } catch (err: any) {
      setError("Error al cargar la configuración de horarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayId: string) => {
    if (!config) return;
    const dayConfig = config[dayId] || { enabled: false };
    setConfig({
      ...config,
      [dayId]: { ...dayConfig, enabled: !dayConfig.enabled },
    });
  };

  const handleAddRange = (dayId: string) => {
    if (!config) return;
    const dayConfig = config[dayId] || { enabled: true };
    const ranges = [...(dayConfig.ranges || []), { start: "09:00", end: "18:00" }];
    setConfig({
      ...config,
      [dayId]: { ...dayConfig, ranges, interval: dayConfig.interval || 60 },
    });
  };

  const handleRemoveRange = (dayId: string, index: number) => {
    if (!config) return;
    const dayConfig = config[dayId];
    const ranges = (dayConfig.ranges || []).filter((_, i) => i !== index);
    setConfig({
      ...config,
      [dayId]: { ...dayConfig, ranges },
    });
  };

  const formatInputTime = (value: string, oldValue: string) => {
    if (value.length < oldValue.length) return value;
    const cleanValue = value.replace(/[^0-9:]/g, "");
    if (cleanValue.length === 2 && !cleanValue.includes(":")) {
      return cleanValue + ":";
    }
    return cleanValue.slice(0, 5);
  };

  const handleUpdateRange = (dayId: string, index: number, field: "start" | "end", value: string) => {
    if (!config) return;
    const dayConfig = config[dayId];
    const ranges = [...(dayConfig.ranges || [])];
    const oldValue = ranges[index][field] || "";
    
    ranges[index] = { ...ranges[index], [field]: formatInputTime(value, oldValue) };
    setConfig({
      ...config,
      [dayId]: { ...dayConfig, ranges },
    });
  };

  const handleAddSlot = (dayId: string) => {
    if (!config) return;
    const dayConfig = config[dayId] || { enabled: true };
    const slots = [...(dayConfig.slots || []), "09:00"];
    setConfig({
      ...config,
      [dayId]: { ...dayConfig, slots },
    });
  };

  const handleRemoveSlot = (dayId: string, index: number) => {
    if (!config) return;
    const dayConfig = config[dayId];
    const slots = (dayConfig.slots || []).filter((_, i) => i !== index);
    setConfig({
      ...config,
      [dayId]: { ...dayConfig, slots },
    });
  };

  const handleUpdateSlot = (dayId: string, index: number, value: string) => {
    if (!config) return;
    const dayConfig = config[dayId];
    const slots = [...(dayConfig.slots || [])];
    const oldValue = slots[index] || "";
    
    slots[index] = formatInputTime(value, oldValue);
    setConfig({
      ...config,
      [dayId]: { ...dayConfig, slots },
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "00:00";
    if (time.includes(":")) {
      const parts = time.split(":");
      const h = parts[0].padStart(2, '0');
      const m = (parts[1] || '00').padEnd(2, '0');
      return `${h}:${m}`;
    }
    const h = time.padStart(2, '0');
    return `${h}:00`;
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      const cleanedConfig: ScheduleConfig = {};
      Object.keys(config).forEach(dayId => {
        const day = config[dayId];
        cleanedConfig[dayId] = { ...day, interval: day.interval ?? 0 };
        if (day.ranges) {
          cleanedConfig[dayId].ranges = day.ranges.map(r => ({
            start: formatTime(r.start),
            end: formatTime(r.end)
          }));
        }
        if (day.slots) {
          cleanedConfig[dayId].slots = day.slots.map(s => formatTime(s));
        }
        if (cleanedConfig[dayId].ranges?.length === 0) delete cleanedConfig[dayId].ranges;
        if (cleanedConfig[dayId].slots?.length === 0) delete cleanedConfig[dayId].slots;
      });
      await settingsService.updateSchedule({ schedule_config: cleanedConfig });
      setConfig(cleanedConfig);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Horarios actualizados con éxito</Alert>}

      <Box>
        {DAYS.map((day, index) => {
          const dayConfig = config?.[day.id] || { enabled: false };
          return (
            <React.Fragment key={day.id}>
              <Box sx={{ py: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: dayConfig.enabled ? 3 : 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dayConfig.enabled}
                        onChange={() => handleToggleDay(day.id)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="subtitle1" fontWeight="700" sx={{ minWidth: 100 }}>
                        {day.name}
                      </Typography>
                    }
                    sx={{ flexGrow: 1 }}
                  />
                  {dayConfig.enabled && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {dayConfig.ranges && dayConfig.ranges.length > 0 && (
                        <Chip label="Rangos Activos" size="small" color="primary" variant="outlined" />
                      )}
                      {dayConfig.slots && dayConfig.slots.length > 0 && (
                        <Chip label="Horarios Fijos" size="small" color="secondary" variant="outlined" />
                      )}
                    </Box>
                  )}
                </Box>

                {dayConfig.enabled && (
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                    gap: 4,
                    mt: 3 
                  }}>
                    <Box>
                      <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 2, display: 'block', textTransform: 'uppercase' }}>
                        Rangos Automáticos (Generación por Intervalo)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(dayConfig.ranges || []).map((range, idx) => (
                          <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <Input
                              label="Inicio"
                              type="time"
                              value={range.start}
                              onChange={(e) => handleUpdateRange(day.id, idx, "start", e.target.value)}
                              sx={{ mb: 0, width: 130 }}
                            />
                            <Input
                              label="Fin"
                              type="time"
                              value={range.end}
                              onChange={(e) => handleUpdateRange(day.id, idx, "end", e.target.value)}
                              sx={{ mb: 0, width: 130 }}
                            />
                            <IconButton color="error" onClick={() => handleRemoveRange(day.id, idx)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                          <OutlinedButton
                            size="small"
                            onClick={() => handleAddRange(day.id)}
                          >
                            + Agregar Rango
                          </OutlinedButton>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ borderLeft: { md: '1px solid' }, borderColor: 'divider', pl: { md: 4 } }}>
                      <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 2, display: 'block', textTransform: 'uppercase' }}>
                        Horarios Fijos adicionales
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(dayConfig.slots || []).map((slot, idx) => (
                          <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <Input
                              label="Hora"
                              type="time"
                              value={slot}
                              onChange={(e) => handleUpdateSlot(day.id, idx, e.target.value)}
                              sx={{ mb: 0, width: 130 }}
                            />
                            <IconButton color="error" onClick={() => handleRemoveSlot(day.id, idx)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <OutlinedButton
                            size="small"
                            onClick={() => handleAddSlot(day.id)}
                          >
                            + Hora
                          </OutlinedButton>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Útil para agregar horarios específicos que no encajan en el intervalo automático.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              {index < DAYS.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <ContainedButton
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
        </ContainedButton>
      </Box>
    </Box>
  );
}
