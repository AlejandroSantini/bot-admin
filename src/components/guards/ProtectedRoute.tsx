import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  moduleKey?: string;
}

export default function ProtectedRoute({
  children,
  moduleKey,
}: ProtectedRouteProps) {
  const { isAuthenticated, modulesConfig, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (moduleKey && modulesConfig && modulesConfig[moduleKey] === false) {
    return <Navigate to="/inicio" replace />;
  }

  return <>{children}</>;
}
