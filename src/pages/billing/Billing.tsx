// Cambio mínimo para forzar deploy
import React, { useState, useEffect } from "react";

import {
  Box,
  Typography,
  Switch,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  MonetizationOn as MoneyIcon,
  CreditCard as CardIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";

import { settingsService } from "../../services/settingsService";
import { ContainedButton } from "../../components/common/ContainedButton";

interface BillingData {
  messages_sent: number;
  cost_per_message_usd: number;
  dollar_rate: number;
  estimated_cost_usd: number;
  estimated_cost_ars: number;
}

export default function Billing() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [templatesEnabled, setTemplatesEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch billing data
        const billingRes = await settingsService.getBilling();
        if (billingRes.status && billingRes.data) {
          setBillingData(billingRes.data);
        }

        // Fetch global config for templates_enabled
        const configRes = await settingsService.getConfig();
        const config = configRes?.data || configRes?.config || configRes;
        if (config?.templates_enabled !== undefined) {
          setTemplatesEnabled(!!config.templates_enabled);
        } else {
          setTemplatesEnabled(false);
        }
      } catch (err) {
        console.error("Error loading billing data", err);
        setError("Error al cargar la información de facturación");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsService.updateConfig({
        config: {
          templates_enabled: !!templatesEnabled,
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mx: "auto", p: { xs: 1, sm: 3 }, width: '100%', boxSizing: 'border-box' }}>
      <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
        Facturación y Consumos
      </Typography>

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

      <Grid container spacing={3}>
        {/* Consumo Estimado */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card 
            variant="outlined" 
            sx={{ 
              borderRadius: 1.5, 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <MoneyIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="subtitle1" fontWeight="700">
                  Consumo Estimado (Mes Actual)
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Mensajes Enviados</Typography>
                      <Tooltip title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Conteo de plantillas enviadas (mensajes automáticos o manuales por fuera de las 24hs).
                          </Typography>
                        </Box>
                      } arrow>
                        <HelpIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="h4" fontWeight="700" color="primary" sx={{ mt: 1 }}>
                      {billingData?.messages_sent || 0}
                    </Typography>
                  </Box>

                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Costo por Mensaje</Typography>
                      <Tooltip title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5 }}>Tarifas oficiales Meta:</Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>• Marketing: USD 0.065</Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>• Utilidad / Recordatorios: USD 0.030</Typography>
                        </Box>
                      } arrow>
                        <HelpIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                      USD {billingData?.cost_per_message_usd?.toFixed(3) || "0.065"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>


              <Box sx={{ mt: 3, p: 2.5, bgcolor: 'action.selected', borderRadius: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>TOTAL ESTIMADO</Typography>
                <Typography variant="h3" fontWeight="800" color="primary" sx={{ mb: 0.5, fontSize: { xs: '2rem', sm: '3rem' } }}>
                  USD {billingData?.estimated_cost_usd?.toFixed(2) || "0.00"}
                </Typography>

                <Typography variant="subtitle1" fontWeight="600" color="text.secondary">
                  (~ ARS {billingData?.estimated_cost_ars?.toLocaleString('es-AR', { maximumFractionDigits: 0 }) || "0"})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Cotización Dólar Tarjeta: ${billingData?.dollar_rate || "-"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración de Plantillas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 1.5, height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <CardIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
                  <Typography variant="subtitle1" fontWeight="700">
                    Método de Pago
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1.5, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="600">
                      Permitir Plantillas
                    </Typography>
                    <Switch
                      checked={!!templatesEnabled}
                      onChange={(e) => setTemplatesEnabled(e.target.checked)}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Habilita el envío de mensajes fuera de las 24 horas (Recordatorios, Avisos manuales).
                  </Typography>
                </Box>

                <Alert severity="warning" sx={{ fontSize: '0.75rem', '& .MuiAlert-icon': { fontSize: 20 } }}>
                  <strong>¡Importante!</strong> Requiere tener un método de pago válido asociado en Meta/Kapso. Si no hay saldo, los mensajes no se entregarán.
                </Alert>
              </Box>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                <ContainedButton onClick={handleSaveConfig} disabled={saving}>
                  {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                </ContainedButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
