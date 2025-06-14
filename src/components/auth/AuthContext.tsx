

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import type { User } from "../../lib/types";
import type { ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await axios.get<User>("http://localhost:7700/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Auth fetch failed:", err);
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
