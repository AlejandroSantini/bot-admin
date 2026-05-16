import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { ContainedButton } from "../../components/common/ContainedButton";
import { CreditCard, AccountBalance, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../services/auth";
import { CustomPaper } from "../../components/common/CustomPaper";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState("card");
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handlePayment = async () => {
    setLoading(true);
    // Simular procesamiento de pago
    setTimeout(async () => {
      try {
        const pendingUser = JSON.parse(localStorage.getItem("pending_user") || "{}");
        if (!pendingUser.email) throw new Error("No hay datos de usuario pendientes.");

        // LLAMADA REAL AL BACKEND PARA REGISTRAR
        const response = await authService.register({
          full_name: pendingUser.full_name,
          email: pendingUser.email,
          phone: pendingUser.phone,
          password: pendingUser.password
        });

        if (response.token) {
          setSuccess(true);
          localStorage.removeItem("pending_user");
          
          // Simular login automático después de 2 segundos de éxito
          setTimeout(() => {
             window.location.href = "/inicio"; 
          }, 2000);
        }
      } catch (err: any) {
        console.error("Error en el registro post-pago:", err);
        alert(err.message || "Error al procesar el registro.");
      } finally {
        setLoading(false);
      }
    }, 3000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        p: 2,
      }}
    >
      <CustomPaper
        sx={{
          maxWidth: 450,
          width: "100%",
          p: 4,
          background: isDark 
            ? 'rgba(26, 26, 26, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 8px 30px rgba(0,0,0,0.05)",
        }}
      >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
              <span className="tino-font" style={{ color: '#0b8185', fontWeight: 900 }}>tino</span>
            </Typography>
          </Box>

          <Stepper 
            activeStep={1} 
            sx={{ 
              mb: 4, 
              "& .MuiStepIcon-root.Mui-active": { color: "#0b8185" },
              "& .MuiStepIcon-root.Mui-completed": { color: "#0b8185" },
              "& .MuiStepLabel-label": { fontSize: "0.75rem", fontWeight: 500 },
            }}
          >
            <Step><StepLabel>Registro</StepLabel></Step>
            <Step><StepLabel>Pago</StepLabel></Step>
            <Step><StepLabel>Setup</StepLabel></Step>
          </Stepper>

          {success ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CheckCircle sx={{ fontSize: 70, color: "#4ade80", mb: 2 }} />
              <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                ¡Pago Exitoso!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configurando tu asistente inteligente...
              </Typography>
              <CircularProgress size={24} sx={{ mt: 4, color: "#0b8185" }} />
            </Box>
          ) : (
            <>
              <Box sx={{ 
                mb: 4, 
                textAlign: "center", 
                p: 3, 
                borderRadius: 1.5, 
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(11, 129, 133, 0.04)",
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(11, 129, 133, 0.1)"
              }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Suscripción Mensual
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5, my: 1 }}>
                  <Typography variant="h3" fontWeight={900} color="primary.main">
                    $54.999
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                    /mes
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Acceso ilimitado a todas las funciones.
                </Typography>
              </Box>

              <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", mb: 2, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                Selecciona tu método de pago
              </Typography>
              
              <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  px: 2,
                  py: 1.5, 
                  mb: 2, 
                  borderRadius: 1.5, 
                  border: "1px solid",
                  borderColor: method === "card" ? "primary.main" : "divider",
                  backgroundColor: method === "card" ? (isDark ? "rgba(11, 129, 133, 0.1)" : "rgba(11, 129, 133, 0.05)") : "transparent",
                  transition: "all 0.2s ease"
                }}>
                  <FormControlLabel 
                    value="card" 
                    control={<Radio size="small" color="primary" />} 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                        <CreditCard sx={{ mr: 1.5, fontSize: 20, color: method === "card" ? "primary.main" : "text.secondary" }} /> 
                        <Typography variant="body2" fontWeight={method === "card" ? 600 : 400}>
                          Tarjeta de Crédito / Débito
                        </Typography>
                      </Box>
                    } 
                    sx={{ width: "100%", m: 0 }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  px: 2,
                  py: 1.5, 
                  mb: 4, 
                  borderRadius: 1.5, 
                  border: "1px solid",
                  borderColor: method === "transfer" ? "primary.main" : "divider",
                  backgroundColor: method === "transfer" ? (isDark ? "rgba(11, 129, 133, 0.1)" : "rgba(11, 129, 133, 0.05)") : "transparent",
                  transition: "all 0.2s ease"
                }}>
                  <FormControlLabel 
                    value="transfer" 
                    control={<Radio size="small" color="primary" />} 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                        <AccountBalance sx={{ mr: 1.5, fontSize: 20, color: method === "transfer" ? "primary.main" : "text.secondary" }} /> 
                        <Typography variant="body2" fontWeight={method === "transfer" ? 600 : 400}>
                          Transferencia Bancaria
                        </Typography>
                      </Box>
                    } 
                    sx={{ width: "100%", m: 0 }}
                  />
                </Box>
              </RadioGroup>

              <ContainedButton
                fullWidth
                loading={loading}
                onClick={handlePayment}
              >
                Pagar ahora
              </ContainedButton>

              <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 3, display: "block" }}>
                Transacción segura encriptada con SSL de 256 bits.
              </Typography>
            </>
          )}
      </CustomPaper>
    </Box>
  );
}
