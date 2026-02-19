import { createContext } from "react";

interface User {
  id: string | number;
  name: string;
  email?: string;
  phone_number_id?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone_number_id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export type { User, AuthContextType };
