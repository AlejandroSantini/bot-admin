import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme
} from "@mui/material";
import {
  Message as MessageIcon,
  EventAvailable as SuccessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  EventBusy as CancelIcon,
  Percent as RateIcon,
  TrendingUp as TrendIcon
} from "@mui/icons-material";
import { dashboardService, type DashboardStats } from "../../services/dashboardService";
import { CustomPaper } from "../../components/common/CustomPaper";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"day" | "weekly" | "monthly" | "yearly">("weekly");
  const theme = useTheme();

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

  const statCards = [
    {
      title: "Mensajes Enviados",
      value: stats?.mensajes_enviados || 0,
      icon: <MessageIcon sx={{ fontSize: 18 }} />,
      color: "#3f51b5",
      gradient: "linear-gradient(135deg, #3f51b5 0%, #7986cb 100%)"
    },
    {
      title: "Turnos Confirmados",
      value: stats?.turnos_confirmados || 0,
      icon: <SuccessIcon sx={{ fontSize: 18 }} />,
      color: "#4caf50",
      gradient: "linear-gradient(135deg, #4caf50 0%, #81c784 100%)"
    },
    {
      title: "Clientes Atendidos",
      value: stats?.clientes_atendidos || 0,
      icon: <PeopleIcon sx={{ fontSize: 18 }} />,
      color: "#ff9800",
      gradient: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)"
    },
    {
      title: "Dinero Generado",
      value: `$${(stats?.dinero_generado || 0).toLocaleString()}`,
      icon: <MoneyIcon sx={{ fontSize: 18 }} />,
      color: "#009688",
      gradient: "linear-gradient(135deg, #009688 0%, #4db6ac 100%)"
    },
    {
      title: "Turnos Cancelados",
      value: stats?.turnos_cancelados || 0,
      icon: <CancelIcon sx={{ fontSize: 18 }} />,
      color: "#f44336",
      gradient: "linear-gradient(135deg, #f44336 0%, #e57373 100%)"
    },
    {
      title: "Tasa de Cancelación",
      value: stats?.tasa_cancelacion || "0.00%",
      icon: <RateIcon sx={{ fontSize: 18 }} />,
      color: "#9c27b0",
      gradient: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)"
    }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: "auto", px: { xs: 0, sm: 2, md: 3 }, py: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between", 
        alignItems: { xs: "flex-start", md: "center" },
        mb: 4,
        gap: 2,
        px: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 800, 
            color: "text.primary", 
            fontSize: { xs: '1.5rem', sm: '1.8rem' }
          }}>
            Estadísticas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rendimiento en tiempo real.
          </Typography>
        </Box>

        <FormControl variant="outlined" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
          <InputLabel id="filter-label">Periodo</InputLabel>
          <Select
            labelId="filter-label"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            label="Periodo"
            size="small"
            sx={{ borderRadius: 2, bgcolor: "background.paper" }}
          >
            <MenuItem value="day">Hoy</MenuItem>
            <MenuItem value="weekly">Esta Semana</MenuItem>
            <MenuItem value="monthly">Este Mes</MenuItem>
            <MenuItem value="yearly">Este Año</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={40} thickness={5} />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr 1fr', 
            md: '1fr 1fr 1fr' 
          },
          gap: 2,
          width: '100%',
          px: { xs: 1, sm: 0 } 
        }}>
          {statCards.map((card, index) => (
            <Box key={index} sx={{ 
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              minHeight: 130,
            }}>
              <Box sx={{ 
                p: 1.5, 
                display: "flex", 
                alignItems: "center", 
                gap: 1.5,
                background: card.gradient,
                color: "white",
                height: 48,
                flexShrink: 0
              }}>
                <Box sx={{ 
                  width: 32,
                  height: 32,
                  borderRadius: 1, 
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {card.icon}
                </Box>
                <Typography variant="caption" fontWeight="700" sx={{ 
                   textTransform: 'uppercase', 
                   letterSpacing: '0.5px',
                   whiteSpace: 'nowrap'
                }}>
                  {card.title}
                </Typography>
              </Box>

              {/* Card Body (Value) */}
              <Box sx={{ 
                p: 2.5, 
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: "text.primary",
                  fontSize: { xs: '1.8rem', sm: '2.2rem' }
                }}>
                  {card.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
