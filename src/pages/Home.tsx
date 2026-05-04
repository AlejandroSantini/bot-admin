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

    if (onboardingStep === 1) {
      navigate("/asistente", { replace: true });
      return;
    }

    // Si ya completó onboarding (paso 2)
    if (!modulesConfig) {
      navigate("/configuracion", { replace: true });
      return;
    }

    const firstEnabledModule = menuItems.find(item => modulesConfig[item.configKey] !== false);

    if (firstEnabledModule) {
      navigate(firstEnabledModule.path, { replace: true });
    } else {
      navigate("/configuracion", { replace: true });
    }
  }, [modulesConfig, isLoading, onboardingStep, navigate]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
