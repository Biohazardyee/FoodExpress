import { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

interface TokenPayload {
  id: string;
  email: string;
  username: string;
  roles: string[];
  exp: number;
}

export function useAuth() {
  const [user, setUser] = useState<TokenPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<TokenPayload>(token);

      // Optionally check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setUser(null);
        return;
      }

      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  return user;
}
