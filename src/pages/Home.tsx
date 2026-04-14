import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CircularProgress, Box } from "@mui/material";

const menuItems = [
  { path: "/reservas", configKey: "reservas" },
  { path: "/clientes", configKey: "clientes" },
  { path: "/servicios", configKey: "servicios" },
  { path: "/productos", configKey: "productos" },
  { path: "/campanas", configKey: "campanas" },
];

export default function Home() {
  const { modulesConfig, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!modulesConfig) {
      navigate("/reservas", { replace: true });
      return;
    }

    const firstEnabledModule = menuItems.find(item => modulesConfig[item.configKey] !== false);

    if (firstEnabledModule) {
      navigate(firstEnabledModule.path, { replace: true });
    } else {
      console.warn("No modules enabled for this tenant");
    }
  }, [modulesConfig, isLoading, navigate]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
