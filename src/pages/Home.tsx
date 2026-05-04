import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CircularProgress, Box } from "@mui/material";

const menuItems = [
  { path: "/estadisticas", configKey: "reservas" },
  { path: "/reservas", configKey: "reservas" },
  { path: "/clientes", configKey: "clientes" },
  { path: "/servicios", configKey: "servicios" },
  { path: "/productos", configKey: "productos" },
  { path: "/campanas", configKey: "campanas" },
];

export default function Home() {
  const { modulesConfig, isLoading, onboardingStep } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Lógica de Onboarding
    if (onboardingStep === 0) {
      navigate("/configuracion", { replace: true });
      return;
    }

    // Por ahora, siempre llevar al asistente (Flujo del bot) al inicio
    // ya que las estadísticas/dashboard aún no están activos
    navigate("/asistente", { replace: true });
  }, [modulesConfig, isLoading, onboardingStep, navigate]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
