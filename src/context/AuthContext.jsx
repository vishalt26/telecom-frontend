import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getToken, setToken, clearToken } from "../api/tokenStore";
import { setUnauthorizedHandler } from "../api/client";
import { login as apiLogin, register as apiRegister, fetchMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (emailOrPhone, password) => {
    const { accessToken, user: loggedInUser } = await apiLogin({ emailOrPhone, password });
    setToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback((data) => apiRegister(data), []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const updateUserLocal = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, updateUserLocal, isAuthenticated: !!user }),
    [user, initializing, login, register, logout, updateUserLocal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
