import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthContext,
  type User,
  type AuthContextType,
} from "../context/AuthContext";
import authService from "../services/auth";
import api from "../services/api";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [modulesConfig, setModulesConfig] = useState<Record<string, boolean> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchModulesConfig = async () => {
    try {
      const res = await api.get("/api/tenants/me");
      if (res.data?.status && res.data?.data?.modules_config) {
        setModulesConfig(res.data.data.modules_config);
        return res.data.data.modules_config;
      }
    } catch (err) {
      console.error("Error fetching modules config:", err);
    }
    return null;
  };

  const login = async (phone_number_id: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ phone_number_id, password });
      setUser(res.user);
      setToken(res.token);
      await fetchModulesConfig();
      navigate("/inicio");
    } catch (err) {
      console.error("Error en login:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setModulesConfig(null);
    navigate("/iniciar-sesion");
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          await fetchModulesConfig();
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    modulesConfig,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
