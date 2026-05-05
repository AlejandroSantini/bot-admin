import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Alert,
  MenuItem,
  Select,
  FormControl,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Message as MessageIcon,
  EventAvailable as SuccessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  EventBusy as CancelIcon,
  Percent as RateIcon,
  TrendingUp as TrendIcon,
  InfoOutlined as InfoIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { dashboardService, type DashboardStats } from "../../services/dashboardService";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"day" | "weekly" | "monthly" | "yearly">("weekly");
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats(filter);
      setStats(data);
    } catch (err) {
      setError("Error al cargar las estadísticas del dashboard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mainStats = [
    {
      title: "Mensajes Enviados",
      value: stats?.mensajes_enviados || 0,
      icon: <MessageIcon sx={{ fontSize: 22 }} />,
      color: "#3b82f6",
      trend: stats?.trends?.mensajes_enviados || "0%"
    },
    {
      title: "Dinero Generado",
      value: `$${(stats?.dinero_generado || 0).toLocaleString()}`,
      icon: <MoneyIcon sx={{ fontSize: 22 }} />,
      color: "#10b981",
      trend: stats?.trends?.dinero_generado || "0%"
    },
    {
      title: "Clientes Atendidos",
      value: stats?.clientes_atendidos || 0,
      icon: <PeopleIcon sx={{ fontSize: 22 }} />,
      color: "#f59e0b",
      trend: stats?.trends?.clientes_atendidos || "0%"
    }
  ];

  const secondaryStats = [
    {
      title: "Turnos Confirmados",
      value: stats?.turnos_confirmados || 0,
      icon: <SuccessIcon sx={{ fontSize: 18 }} />,
      color: "#10b981"
    },
    {
      title: "Turnos Cancelados",
      value: stats?.turnos_cancelados || 0,
      icon: <CancelIcon sx={{ fontSize: 18 }} />,
      color: "#ef4444"
    },
    {
      title: "Tasa de Cancelación",
      value: stats?.tasa_cancelacion || "0.00%",
      icon: <RateIcon sx={{ fontSize: 18 }} />,
      color: "#8b5cf6"
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: "auto", width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between", 
        alignItems: { xs: "flex-start", sm: "center" },
        mb: 3,
        gap: 2
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Estadísticas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Resumen del rendimiento de tu asistente inteligente.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Sincronizar datos">
            <IconButton onClick={fetchStats} size="small" sx={{ 
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' }
            }}>
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              sx={{ borderRadius: 2.5, fontWeight: 600, fontSize: '0.85rem' }}
            >
              <MenuItem value="day">Hoy</MenuItem>
              <MenuItem value="weekly">Esta Semana</MenuItem>
              <MenuItem value="monthly">Este Mes</MenuItem>
              <MenuItem value="yearly">Este Año</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      {/* Main Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {mainStats.map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card sx={{ 
              borderRadius: 4, 
              border: '1px solid',
              borderColor: 'divider',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: `${stat.color}60`
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ 
                    p: 1.2, 
                    borderRadius: 2, 
                    bgcolor: `${stat.color}15`, 
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </Box>
                  <Box sx={{ 
                    px: 1.2, 
                    py: 0.4, 
                    borderRadius: 1.5, 
                    bgcolor: 'rgba(16, 185, 129, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}>
                    <TrendIcon sx={{ color: '#10b981', fontSize: 14 }} />
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>
                      {loading ? <Skeleton width={30} /> : stat.trend}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: 1.5, 
                  display: 'block', 
                  mb: 1.5 
                }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontWeight: 900, 
                  letterSpacing: -1,
                  fontSize: { xs: '1.8rem', lg: '2.2rem' }
                }}>
                  {loading ? <Skeleton width="60%" /> : stat.value}
                </Typography>
                
                <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
                  Tendencia positiva este periodo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Secondary Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {secondaryStats.map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card sx={{ 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <CardContent sx={{ py: 2.5, px: 3, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    <Box sx={{ 
                      color: stat.color, 
                      display: 'flex',
                      p: 0.8,
                      borderRadius: 1.5,
                      bgcolor: `${stat.color}10`,
                      flexShrink: 0
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    flexShrink: 0,
                    ml: 'auto'
                  }}>
                    {loading ? <Skeleton width={40} /> : stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Section */}
      <Card sx={{ 
        borderRadius: { xs: 3, md: 4 }, 
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 2, md: 3 },
        overflow: 'hidden'
      }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 800 }}>Rendimiento Mensual</Typography>
              <Tooltip title="Análisis detallado de interacciones diarias">
                <InfoIcon sx={{ fontSize: 16, color: 'text.disabled', cursor: 'help' }} />
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">Volumen de mensajes y conversiones detectadas</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, p: 1, px: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', alignSelf: { xs: 'stretch', sm: 'auto' }, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Mensajes</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Conversiones</Typography>
            </Box>
          </Box>
        </Box>

        {/* Bar Chart */}
        <Box sx={{ 
          maxWidth: '100%', 
          overflowX: 'auto', 
          pb: 2,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 }
        }}>
          <Box sx={{ 
            position: 'relative', 
            height: 200, 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: 1.5, 
            px: 1,
            minWidth: { xs: 600, md: 'auto' }
          }}>
          {[0, 25, 50, 75, 100].map((level) => (
            <Box key={level} sx={{ 
              position: 'absolute', 
              bottom: `${level}%`, 
              left: 0, 
              right: 0, 
              height: '1px', 
              bgcolor: 'divider',
              zIndex: 0
            }} />
          ))}

          {(stats?.history || []).map((point, i) => {
            const maxVal = Math.max(...(stats?.history || []).map(p => p.count), 10);
            const heightPerc = (point.count / maxVal) * 90;
            const isLast = i === (stats?.history?.length || 0) - 1;
            
            return (
              <Box key={i} sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 1, 
                zIndex: 1,
                position: 'relative',
                height: '100%',
                justifyContent: 'flex-end'
              }}>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: `${heightPerc}%`, 
                    background: isLast 
                      ? "linear-gradient(to top, #3b82f6, #60a5fa)" 
                      : isDark
                        ? "linear-gradient(to top, rgba(59,130,246,0.15), rgba(59,130,246,0.25))"
                        : "linear-gradient(to top, rgba(59,130,246,0.12), rgba(59,130,246,0.20))",
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    minHeight: point.count > 0 ? 4 : 0,
                    '&:hover': {
                      background: "linear-gradient(to top, #3b82f6, #93c5fd)",
                      transform: 'scaleY(1.02)',
                      boxShadow: '0 0 25px rgba(59, 130, 246, 0.3)',
                      '& .val-tooltip': { opacity: 1, transform: 'translateY(-10px)' }
                    }
                  }} 
                >
                  <Box className="val-tooltip" sx={{ 
                    position: 'absolute', 
                    top: -30, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    bgcolor: 'background.paper', 
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    px: 1, 
                    py: 0.3, 
                    borderRadius: 1, 
                    fontSize: '0.65rem', 
                    fontWeight: 800,
                    opacity: 0,
                    transition: '0.2s',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: 2
                  }}>
                    {point.count} turnos
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
        
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', px: 1 }}>
          {(stats?.history || []).filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 7)) === 0).map((point, i) => (
            <Typography key={i} variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>{point.date}</Typography>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
