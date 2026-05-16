import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Payment as PaymentIcon } from "@mui/icons-material";
import { settingsService } from "../../services/settingsService";
import type { PaymentConfig } from "../../services/settingsService";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";

export default function PaymentsTab() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
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
      const data = await settingsService.getPaymentConfig();
      // Ensure we have default values for the UI if fields are missing
      const configWithDefaults: PaymentConfig = {
        alias: data.alias || "",
        payment_enabled: data.payment_enabled || false,
        deposit_amount: data.deposit_amount || 0,
        cancellation_hours: data.cancellation_hours || 0,
        require_payment_for: data.require_payment_for || "all"
      };
      setConfig(configWithDefaults);
    } catch (err) {
      setError("Error al cargar la configuración de pagos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      // Ensure numerical values default to 0 for the API if empty
      const apiConfig = {
        ...config,
        deposit_amount: config.deposit_amount ?? 0,
        cancellation_hours: config.cancellation_hours ?? 0,
      };
      await settingsService.updatePaymentConfig({ payment_config: apiConfig });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PaymentConfig, value: any) => {
    if (!config) return;
    // Allow empty string to be undefined in state
    const processedValue = (field === "deposit_amount" || field === "cancellation_hours") && value === "" 
      ? undefined 
      : value;
    setConfig({ ...config, [field]: processedValue });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Configuración guardada correctamente</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PaymentIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">
                Mercado Pago & Cobros
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={config?.payment_enabled || false}
                    onChange={(e) => handleChange("payment_enabled", e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" fontWeight="500">
                    {config?.payment_enabled ? "Activo" : "Inactivo"}
                  </Typography>
                }
              />
            </Box>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 2 
            }}>
              <Input
                label="Alias de Mercado Pago"
                placeholder="ej: mi.negocio.alias"
                value={config?.alias || ""}
                onChange={(e) => handleChange("alias", e.target.value)}
                sx={{ mb: 0 }}
              />
              <Select
                label="Requerir pago para"
                value={config?.require_payment_for || "all"}
                onChange={(e) => handleChange("require_payment_for", e.target.value)}
                options={[
                  { value: "all", label: "Todos los clientes" },
                  { value: "new_only", label: "Solo clientes nuevos" },
                ]}
                helperText="El bot detecta si el número de WhatsApp ya está registrado."
                sx={{ mb: 0, mt: 0 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* RESERVA CARD */}
        <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
              Reserva y Cancelación
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 2 
            }}>
              <Input
                label="Monto de Seña (Pesos)"
                type="number"
                value={config?.deposit_amount ?? ""}
                onChange={(e) => handleChange("deposit_amount", e.target.value === "" ? 0 : parseInt(e.target.value))}
                icon={<Typography variant="caption" sx={{ mr: 1 }}>$</Typography>}
                placeholder="0"
                sx={{ mb: 0 }}
              />
              <Input
                label="Horas de anticipación para cancelar"
                type="number"
                value={config?.cancellation_hours ?? ""}
                onChange={(e) => handleChange("cancellation_hours", e.target.value === "" ? 0 : parseInt(e.target.value))}
                helperText="Horas antes para cancelar sin perder la seña"
                placeholder="0"
                sx={{ mb: 0 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
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
