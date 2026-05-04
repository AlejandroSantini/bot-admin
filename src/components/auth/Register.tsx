import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { Input } from "../common/Input";
import { ContainedButton } from "../common/ContainedButton";
import { Visibility, VisibilityOff, Person, Email, Lock, Phone } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface RegisterFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export default function Register({ onToggleMode }: { onToggleMode: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setLoading(true);
    try {
      localStorage.setItem("pending_user", JSON.stringify(data));
      navigate("/pago");
    } catch (err: any) {
      setError("Error al registrarse.");
    } finally {
      setLoading(false);
    }
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
          maxWidth: 360,
          width: "100%",
          borderRadius: 2.5,
          backgroundColor: "#1e293b",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="white" gutterBottom>
              Nueva cuenta
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Crea tu perfil para comenzar.
            </Typography>
          </Box>

          <Stepper
            activeStep={0}
            sx={{
              mb: 3,
              "& .MuiStepIcon-root": { fontSize: 16 },
              "& .MuiStepLabel-label": { fontSize: "0.65rem", color: "rgba(255, 255, 255, 0.5) !important" },
              "& .MuiStepLabel-label.Mui-active": { color: "#3b82f6 !important" }
            }}
          >
            <Step><StepLabel>Registro</StepLabel></Step>
            <Step><StepLabel>Pago</StepLabel></Step>
            <Step><StepLabel>Setup</StepLabel></Step>
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1, fontSize: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#f87171" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("full_name", { required: "Requerido" })}
              label="Nombre completo"
              placeholder="Nombre y Apellido"
              error={!!errors.full_name}
              icon={<InputAdornment position="start"><Person sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.3)" }} /></InputAdornment>}
              sx={{ mb: 1.5 }}
            />

            <Input
              {...register("email", { required: "Requerido" })}
              label="Email"
              placeholder="email@ejemplo.com"
              error={!!errors.email}
              icon={<InputAdornment position="start"><Email sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.3)" }} /></InputAdornment>}
              sx={{ mb: 1.5 }}
            />

            <Input
              {...register("phone", { required: "Requerido" })}
              label="WhatsApp (Personal)"
              placeholder="5491144445555"
              error={!!errors.phone}
              icon={<InputAdornment position="start"><Phone sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.3)" }} /></InputAdornment>}
              sx={{ mb: 1.5 }}
            />

            <Input
              {...register("password", { required: "Requerido" })}
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              error={!!errors.password}
              icon={<InputAdornment position="start"><Lock sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.3)" }} /></InputAdornment>}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: "rgba(255, 255, 255, 0.3)" }}>
                      {showPassword ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <ContainedButton
              type="submit"
              fullWidth
              loading={loading}
              sx={{ 
                py: 1.1, 
                fontSize: "0.85rem",
                fontWeight: 700,
                borderRadius: 1.5,
                background: "linear-gradient(to right, #3b82f6, #06b6d4)",
                "&:hover": { background: "linear-gradient(to right, #2563eb, #0891b2)" }
              }}
            >
              Continuar al pago
            </ContainedButton>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
                ¿Ya tienes una cuenta?{" "}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    "&:hover": { textDecoration: "underline" }
                  }}
                  onClick={onToggleMode}
                >
                  Inicia sesión
                </Typography>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
