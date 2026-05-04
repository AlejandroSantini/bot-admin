import { createContext } from "react";

interface User {
  id: string | number;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  phone_number_id?: string;
  meta_phone_number_id?: string;
  role?: string;
  status?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  modulesConfig: Record<string, boolean> | null;
  onboardingStep: number;
  setOnboardingStep: () => Promise<void>;
  login: (phone_number_id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export type { User, AuthContextType };
