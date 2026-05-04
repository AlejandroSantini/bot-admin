import React, { useState, useEffect } from "react";
import { useThemeMode } from "../../providers/ThemeModeProvider";
import {
  Box,
  Typography,
  Switch,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider
} from "@mui/material";
import { 
  DarkMode as DarkModeIcon, 
  SettingsSuggest as ModulesIcon,
  CheckCircle as SaveIcon
} from "@mui/icons-material";
import { settingsService } from "../../services/settingsService";
import { ContainedButton } from "../../components/common/ContainedButton";

interface SystemTabProps {
  initialModulesConfig?: any;
}

export default function SystemTab({ initialModulesConfig }: SystemTabProps) {
  const { mode, toggleColorMode } = useThemeMode();
  const [modulesConfig, setModulesConfig] = useState<Record<string, boolean>>({
    campanas: false,
    clientes: false,
    reservas: false,
    asistente: false,
    productos: false,
    servicios: false,
    facturacion: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialModulesConfig) {
      setModulesConfig({
        campanas: !!initialModulesConfig.campanas,
        clientes: !!initialModulesConfig.clientes,
        reservas: !!initialModulesConfig.reservas,
        asistente: !!initialModulesConfig.asistente,
        productos: !!initialModulesConfig.productos,
        servicios: !!initialModulesConfig.servicios,
        facturacion: !!initialModulesConfig.facturacion,
      });
    }
  }, [initialModulesConfig]);

  const handleToggleModule = (key: string) => {
    setModulesConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveModules = async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsService.updateConfig({
        modules_config: modulesConfig,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reload page to apply changes in sidebar
      window.location.reload();
    } catch (err) {
      setError("Error al guardar la configuración de módulos");
    } finally {
      setSaving(false);
    }
  };

  const moduleLabels: Record<string, { label: string; desc: string }> = {
    reservas: { label: "Reservas", desc: "Habilitar gestión de turnos y calendario" },
    clientes: { label: "Clientes", desc: "Base de datos de clientes y fichas" },
    servicios: { label: "Servicios", desc: "Configuración de catálogo de servicios" },
    productos: { label: "Productos", desc: "Gestión de inventario y venta de productos" },
    facturacion: { label: "Facturación", desc: "Módulo de gestión de cobros y deudas" },
    campanas: { label: "Campañas", desc: "Marketing masivo por WhatsApp" },
    asistente: { label: "Asistente AI", desc: "Respuestas automáticas inteligentes" },
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Configuración guardada. Recargando...</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Apariencia */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DarkModeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">Apariencia</Typography>
            </Box>
            <Box sx={{ 
              p: 1.5, bgcolor: 'action.hover', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="body2" fontWeight="600">Modo Oscuro</Typography>
                <Typography variant="caption" color="text.secondary">Cambia el tema visual del sistema</Typography>
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

        {/* Módulos */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ModulesIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">Módulos del Sistema</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Habilita o deshabilita secciones enteras del administrador según tus necesidades.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {Object.keys(moduleLabels).map((key) => (
                <Box
                  key={key}
                  sx={{
                    p: 1.5,
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid",
                    borderColor: modulesConfig[key] ? "primary.main" : "transparent",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {moduleLabels[key].label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moduleLabels[key].desc}
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={modulesConfig[key]}
                    onChange={() => handleToggleModule(key)}
                  />
                </Box>
              ))}
            </Box>

            <Box sx={{ 
              mt: 3, pt: 1, borderTop: "1px solid", borderColor: "divider",
              display: "flex", justifyContent: "flex-end"
            }}>
              <ContainedButton 
                onClick={handleSaveModules} 
                disabled={saving}
                startIcon={<SaveIcon />}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Módulos"}
              </ContainedButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
