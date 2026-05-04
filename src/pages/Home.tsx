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

    // Redirección dinámica basada en módulos activos
    if (modulesConfig?.reservas) {
      navigate("/reservas", { replace: true });
    } else if (modulesConfig?.clientes) {
      navigate("/clientes", { replace: true });
    } else {
      // Si no hay ninguno de los principales, ir a configuración
      navigate("/configuracion", { replace: true });
    }
  }, [modulesConfig, isLoading, onboardingStep, navigate]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
