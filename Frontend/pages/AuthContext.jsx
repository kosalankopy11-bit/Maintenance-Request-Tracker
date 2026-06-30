import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("mh_token"));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("mh_user") || "null"));

  const login = async (values) => {
    const { data } = await api.post("/auth/login", values);
    localStorage.setItem("mh_token", data.access_token);
    localStorage.setItem("mh_user", JSON.stringify(data));
    setToken(data.access_token);
    setUser(data);
    return data;
  };

  const register = async (values) => {
    const { data } = await api.post("/auth/register", values);
    localStorage.setItem("mh_token", data.access_token);
    localStorage.setItem("mh_user", JSON.stringify(data));
    setToken(data.access_token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("mh_token");
    localStorage.removeItem("mh_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, register, logout, isAuthenticated: Boolean(token) }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
