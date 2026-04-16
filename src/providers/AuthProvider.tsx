import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthContext,
  type User,
  type AuthContextType,
} from "../context/AuthContext";
import authService from "../services/auth";
import api from "../services/api";
import { settingsService } from "../services/settingsService";

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
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        localStorage.setItem("token", urlToken);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }

      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken) {
        try {
          let currentUser = storedUser ? JSON.parse(storedUser) : null;
          
          if (!currentUser || urlToken) {
            const userData = await settingsService.getMe();
            currentUser = userData;
            localStorage.setItem("user", JSON.stringify(userData));
          }

          setUser(currentUser);
          setToken(storedToken);
          await fetchModulesConfig();
        } catch (error) {
          console.error("Auth initialization failed:", error);
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
