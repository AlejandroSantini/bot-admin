import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  EventBusy as BlockIcon,
} from "@mui/icons-material";
import { settingsService, type BlockedDate } from "../../services/settingsService";
import { Input } from "../../components/common/Input";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";

export default function BlockedDatesTab() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getBlockedDates();
      setBlockedDates(data.blocked_dates || []);
    } catch (err: any) {
      setError("Error al cargar las fechas bloqueadas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = () => {
    const now = new Date();
    const start = now.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
    const end = new Date(now.getTime() + 3600000).toISOString().slice(0, 16);
    
    setBlockedDates([
      ...blockedDates,
      { start, end, reason: "" }
    ]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlockedDates(blockedDates.filter((_, i) => i !== index));
  };

  const handleUpdateBlock = (index: number, field: keyof BlockedDate, value: string) => {
    const updated = [...blockedDates];
    updated[index] = { ...updated[index], [field]: value };
    setBlockedDates(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsService.updateBlockedDates({ blocked_dates: blockedDates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError("Error al guardar los bloqueos");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Bloqueos guardados con éxito</Alert>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="700">
          Bloqueos de Agenda
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define periodos específicos donde el bot no otorgará turnos.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {blockedDates.length === 0 ? (
          <Box sx={{ 
            p: 4, 
            textAlign: "center", 
            bgcolor: "action.hover", 
            borderRadius: 1.5,
            border: '1px dashed',
            borderColor: 'divider'
          }}>
            <BlockIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay bloqueos configurados.
            </Typography>
            <Box sx={{ pt: 3 }}>
              <OutlinedButton 
                startIcon={<AddIcon />} 
                onClick={handleAddBlock} 
                size="small"
              >
                Agregar Primer Bloqueo
              </OutlinedButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {blockedDates.map((block, index) => (
              <React.Fragment key={index}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: { xs: "column", md: "row" },
                  gap: 1,
                  alignItems: "center",
                  width: '100%'
                }}>
                  <Input
                    label="Desde"
                    type="datetime-local"
                    value={block.start}
                    onChange={(e) => handleUpdateBlock(index, "start", e.target.value)}
                    sx={{ mb: 0, width: { xs: '100%', md: 220 } }}
                  />
                  <Input
                    label="Hasta"
                    type="datetime-local"
                    value={block.end}
                    onChange={(e) => handleUpdateBlock(index, "end", e.target.value)}
                    sx={{ mb: 0, width: { xs: '100%', md: 220 } }}
                  />
                  <Input
                    label="Motivo"
                    placeholder="ej: Vacaciones"
                    value={block.reason}
                    onChange={(e) => handleUpdateBlock(index, "reason", e.target.value)}
                    sx={{ mb: 0, flexGrow: 1, width: { xs: '100%', md: 'auto' } }}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveBlock(index)} 
                    sx={{ flexShrink: 0 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {index < blockedDates.length - 1 && <Divider sx={{ my: 1, display: { md: 'none' } }} />}
              </React.Fragment>
            ))}
            <Box sx={{ mt: 1 }}>
              <OutlinedButton 
                startIcon={<AddIcon />} 
                onClick={handleAddBlock} 
                size="small"
              >
                Agregar Bloqueo
              </OutlinedButton>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end" }}>
        <ContainedButton 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Bloqueos"}
        </ContainedButton>
      </Box>
    </Box>
  );
}
