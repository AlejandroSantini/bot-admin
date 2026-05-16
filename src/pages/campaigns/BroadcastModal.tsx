import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
} from "@mui/material";
import {
  RocketLaunch as RocketIcon,
  AutoAwesome as SmartIcon,
  Savings as FreeIcon,
  Payments as PaidIcon,
  Timer as ClockIcon,
} from "@mui/icons-material";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { getCampaignStats, runCampaign, type Campaign } from "../../services/campaignService";

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSuccess: () => void;
}

export default function BroadcastModal({ open, onClose, campaign, onSuccess }: BroadcastModalProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ free_count: number; paid_count: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [mode, setMode] = useState<'smart' | 'free'>('smart');

  useEffect(() => {
    if (open && campaign?.id) {
      fetchStats();
      setMode('smart'); // Reset mode when opening
      setExecuting(false); // Reset executing state when opening
    }
  }, [open, campaign]);

  const fetchStats = async () => {
    if (!campaign?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCampaignStats(campaign.id);
      setStats(res.data);
    } catch (err) {
      setError("Error al cargar estadísticas de audiencia");
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!campaign?.id) return;
    setExecuting(true);
    setError(null);
    try {
      await runCampaign(campaign.id, mode);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Error al iniciar el envío");
      setExecuting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, pt: 2, pb: 1 }}>
        <Box sx={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          width: 36, height: 36, borderRadius: '10px', bgcolor: 'primary.main', color: 'white' 
        }}>
          <RocketIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
            Difundir Campaña
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {campaign?.nombre}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 0, pb: 1 }}>
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500, color: 'text.secondary' }}>
              Analizando audiencia...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>
        ) : (
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona una estrategia de envío optimizada:
            </Typography>

            <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as 'smart' | 'free')}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                
                {/* Opción Smart */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: mode === 'smart' ? 'primary.main' : 'divider',
                    bgcolor: mode === 'smart' ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                    borderWidth: mode === 'smart' ? 2 : 1,
                  }}
                  onClick={() => setMode('smart')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Radio checked={mode === 'smart'} value="smart" size="small" sx={{ p: 0.5, mt: -0.2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                        <SmartIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="subtitle2" fontWeight={700} fontSize="0.85rem">Envío Mixto (Alcance Máximo)</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: '0.75rem' }}>
                        Base completa (gratis + pagos).
                      </Typography>
                      
                      <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <FreeIcon sx={{ fontSize: 14, color: 'success.main' }} />
                            <Typography variant="caption" fontWeight={600} color="success.main" fontSize="0.75rem">Gratuitos</Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={800}>{stats?.free_count}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <PaidIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                            <Typography variant="caption" fontWeight={600} color="warning.main" fontSize="0.75rem">Pagos (Plantilla)</Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={800}>{stats?.paid_count}</Typography>
                        </Box>
                        <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', my: 0.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary" fontSize="0.75rem">Costo Estimado (Meta)</Typography>
                          <Typography variant="caption" fontWeight={800} color="primary.main">
                            ${((stats?.paid_count || 0) * 0.063).toFixed(2)} USD
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Opción Free */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: mode === 'free' ? 'success.main' : 'divider',
                    bgcolor: mode === 'free' ? 'rgba(34, 197, 94, 0.02)' : 'transparent',
                    borderWidth: mode === 'free' ? 2 : 1,
                  }}
                  onClick={() => setMode('free')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Radio checked={mode === 'free'} value="free" color="success" size="small" sx={{ p: 0.5, mt: -0.2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                        <ClockIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="subtitle2" fontWeight={700} fontSize="0.85rem">Solo Ventana de 24h (Costo $0)</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: '0.75rem' }}>
                        Solo clientes con interacción reciente.
                      </Typography>

                      <Box sx={{ bgcolor: 'rgba(34, 197, 94, 0.08)', p: 1, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <FreeIcon sx={{ fontSize: 14, color: 'success.main' }} />
                          <Typography variant="caption" fontWeight={700} color="success.dark" fontSize="0.75rem">Total sin costo</Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={800} color="success.dark">{stats?.free_count}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

              </Box>
            </RadioGroup>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0.5, gap: 1 }}>
        <OutlinedButton onClick={onClose} disabled={executing} sx={{ px: 2, height: 36 }}>
          Cancelar
        </OutlinedButton>
        <ContainedButton 
          onClick={handleRun} 
          disabled={loading || executing || (mode === 'free' && stats?.free_count === 0)}
          startIcon={executing ? <CircularProgress size={16} color="inherit" /> : <RocketIcon sx={{ fontSize: 18 }} />}
          sx={{ minWidth: 140, height: 36 }}
        >
          {executing ? 'Enviando...' : 'Iniciar Difusión'}
        </ContainedButton>
      </DialogActions>
    </Dialog>
  );
}
