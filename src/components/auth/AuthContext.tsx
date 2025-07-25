import { createContext, useContext, useState, useEffect } from "react";

import axios from "axios";
import type { User } from "../../lib/types";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void | boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const API = import.meta.env.VITE_API_URL;

    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const fetchUser = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            const res = await axios.get<User>(API + "/users/me", {
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
        navigate("/");
        return true;
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
