import { createContext, useContext, useState, useEffect } from "react";
import type {ReactNode} from "react";
import {jwtDecode} from "jwt-decode";

interface TokenPayload {
  id: string;
  email: string;
  username: string;
  roles: string[];
  exp: number;
}

interface AuthContextType {
  user: TokenPayload | null;
  setUser: (user: TokenPayload | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TokenPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return;
      }
      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
