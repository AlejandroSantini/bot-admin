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
  useTheme,
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
        backgroundColor: "background.default",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          background: isDark 
            ? 'rgba(26, 26, 26, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 8px 30px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
              <span className="tino-font" style={{ color: '#0b8185', fontWeight: 900 }}>tino</span>
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
              Nueva cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea tu perfil para comenzar.
            </Typography>
          </Box>

          <Stepper
            activeStep={0}
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

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, fontSize: "0.75rem" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("full_name", { required: "Requerido" })}
              label="Nombre completo"
              error={!!errors.full_name}
              icon={<InputAdornment position="start"><Person sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>}
              sx={{ mb: 2 }}
            />

            <Input
              {...register("email", { required: "Requerido" })}
              label="Email"
              error={!!errors.email}
              icon={<InputAdornment position="start"><Email sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>}
              sx={{ mb: 2 }}
            />

            <Input
              {...register("phone", { required: "Requerido" })}
              label="WhatsApp (Personal)"
              error={!!errors.phone}
              icon={<InputAdornment position="start"><Phone sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>}
              sx={{ mb: 2 }}
            />

            <Input
              {...register("password", { required: "Requerido" })}
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              error={!!errors.password}
              icon={<InputAdornment position="start"><Lock sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />

            <ContainedButton
              type="submit"
              fullWidth
              loading={loading}
            >
              Continuar al pago
            </ContainedButton>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
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
