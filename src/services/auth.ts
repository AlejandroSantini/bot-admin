import api from "./api";

export interface LoginRequest {
  phone_number_id: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface User {
  id: string | number;
  name: string;
  phone_number_id?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
  tenant?: User;
}

class Auth {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        "/api/tenants/auth/login",
        credentials,
      );
      if (response.data.token) {
        const authData = response.data;
        const userToSave = authData.tenant || authData.user;
        // Guarda cliente y token por separado
        localStorage.setItem("user", JSON.stringify(userToSave));
        localStorage.setItem("token", authData.token);
        return {
          user: userToSave as User,
          token: authData.token,
        };
      } else {
        throw new Error(response.data.message || "Error en el login");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error de conexión");
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Error al hacer logout en el servidor:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token;
  }
}

export default new Auth();
