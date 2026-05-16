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
  useTheme,
} from "@mui/material";
import { Input } from "../common/Input";
import { ContainedButton } from "../common/ContainedButton";
import { useAuth } from "../../hooks/useAuth";
import { Visibility, VisibilityOff, Email, Lock, Person } from "@mui/icons-material";

interface LoginFormData {
  phone_number_id: string;
  password: string;
}

export default function Login({ onToggleMode }: { onToggleMode: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>();

  const { login } = useAuth();
  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);
    try {
      await login(data.phone_number_id, data.password);
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión. Intenta de nuevo.");
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
              Bienvenido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresá tus credenciales para continuar.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, fontSize: "0.85rem" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("phone_number_id", {
                required: "Requerido",
              })}
              label="Phone ID"
              error={!!errors.phone_number_id}
              icon={<InputAdornment position="start"><Person sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>}
              sx={{ mb: 2.5 }}
            />

            <Input
              {...register("password", {
                required: "Requerido",
              })}
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
              disabled={!watch("phone_number_id") || !watch("password")}
            >
              Iniciar sesión
            </ContainedButton>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                ¿No tienes una cuenta?{" "}
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
                  Regístrate
                </Typography>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
