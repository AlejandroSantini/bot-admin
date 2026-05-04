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
} from "@mui/material";
import { Input } from "../common/Input";
import { ContainedButton } from "../common/ContainedButton";
import { useAuth } from "../../hooks/useAuth";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

interface LoginFormData {
  phone_number_id: string;
  password: string;
}

export default function Login({ onToggleMode }: { onToggleMode: () => void }) {
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
        background: "radial-gradient(circle at top left, #1e293b 0%, #0f172a 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 340,
          width: "100%",
          borderRadius: 2.5,
          backgroundColor: "#1e293b",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="white" gutterBottom>
              Bienvenido
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Ingresá tus credenciales para continuar.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1, fontSize: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#f87171" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("phone_number_id", {
                required: "Requerido",
              })}
              label="Phone ID"
              placeholder="ej: 1029384756"
              error={!!errors.phone_number_id}
              icon={<InputAdornment position="start"><Email sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.3)" }} /></InputAdornment>}
              sx={{ mb: 2 }}
            />

            <Input
              {...register("password", {
                required: "Requerido",
              })}
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
              disabled={!watch("phone_number_id") || !watch("password")}
              sx={{ 
                py: 1.1, 
                fontSize: "0.85rem",
                fontWeight: 700,
                borderRadius: 1.5,
                background: "linear-gradient(to right, #3b82f6, #06b6d4)",
                "&:hover": { background: "linear-gradient(to right, #2563eb, #0891b2)" }
              }}
            >
              Iniciar sesión
            </ContainedButton>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
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
