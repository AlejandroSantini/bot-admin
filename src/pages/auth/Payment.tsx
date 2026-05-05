import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  CircularProgress,
} from "@mui/material";
import { ContainedButton } from "../../components/common/ContainedButton";
import { CreditCard, AccountBalance, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../services/auth";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState("card");
  const navigate = useNavigate();
  const { login } = useAuth(); // Usamos login para simular la entrada después del pago

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
             // Ya el authService.register guardó el token y user en localStorage
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
        background: "radial-gradient(circle at top left, #1e293b 0%, #0f172a 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#1e293b",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stepper activeStep={1} sx={{ mb: 3, "& .MuiStepIcon-root": { fontSize: 18 }, "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": { color: "#3b82f6" } }}>
            <Step><StepLabel sx={{"& .MuiStepLabel-label": {color: "white", fontSize: "0.7rem"}}}>Registro</StepLabel></Step>
            <Step><StepLabel sx={{"& .MuiStepLabel-label": {color: "white", fontSize: "0.7rem"}}}>Pago</StepLabel></Step>
            <Step><StepLabel sx={{"& .MuiStepLabel-label": {color: "rgba(255,255,255,0.3)", fontSize: "0.7rem"}}}>Setup</StepLabel></Step>
          </Stepper>

          {success ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CheckCircle sx={{ fontSize: 60, color: "#4ade80", mb: 2 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                ¡Pago Exitoso!
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                Redirigiéndote a tu panel de control...
              </Typography>
              <CircularProgress size={20} sx={{ mt: 3, color: "#3b82f6" }} />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Suscripción Mensual
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#3b82f6">
                  $29.99<Typography component="span" variant="subtitle2" color="rgba(255,255,255,0.5)">/mes</Typography>
                </Typography>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.5)" sx={{ mt: 0.5, display: "block" }}>
                  Acceso total a todas las herramientas.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 3 }} />

              <Typography variant="caption" fontWeight={600} sx={{ color: "rgba(255,255,255,0.4)", mb: 1.5, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                Método de Pago
              </Typography>
              
              <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  px: 1.5,
                  py: 1, 
                  mb: 1.5, 
                  borderRadius: 1.5, 
                  border: "1px solid",
                  borderColor: method === "card" ? "#3b82f6" : "rgba(255,255,255,0.05)",
                  backgroundColor: method === "card" ? "rgba(59, 130, 246, 0.05)" : "transparent"
                }}>
                  <FormControlLabel 
                    value="card" 
                    control={<Radio size="small" sx={{color: "rgba(255,255,255,0.3)", "&.Mui-checked": {color: "#3b82f6"}}} />} 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", fontSize: "0.85rem" }}>
                        <CreditCard sx={{ mr: 1, fontSize: 18 }} /> Tarjeta de Crédito / Débito
                      </Box>
                    } 
                    sx={{ width: "100%", m: 0 }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  px: 1.5,
                  py: 1, 
                  mb: 3, 
                  borderRadius: 1.5, 
                  border: "1px solid",
                  borderColor: method === "transfer" ? "#3b82f6" : "rgba(255,255,255,0.05)",
                  backgroundColor: method === "transfer" ? "rgba(59, 130, 246, 0.05)" : "transparent"
                }}>
                  <FormControlLabel 
                    value="transfer" 
                    control={<Radio size="small" sx={{color: "rgba(255,255,255,0.3)", "&.Mui-checked": {color: "#3b82f6"}}} />} 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", fontSize: "0.85rem" }}>
                        <AccountBalance sx={{ mr: 1, fontSize: 18 }} /> Transferencia Bancaria
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
                sx={{ 
                  py: 1.2, 
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  borderRadius: 1.5,
                  background: "linear-gradient(to right, #3b82f6, #06b6d4)",
                  "&:hover": { background: "linear-gradient(to right, #2563eb, #0891b2)" }
                }}
              >
                Pagar Ahora
              </ContainedButton>

              <Typography variant="caption" color="rgba(255, 255, 255, 0.3)" textAlign="center" sx={{ mt: 2, display: "block" }}>
                Transacción segura encriptada con SSL.
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
