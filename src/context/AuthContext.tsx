import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type User } from "../lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refreshMe: () => Promise<void>;
  login: (usernameOrEmail: string, password: string) => Promise<{ code: number; msg: string }>;
  register: (
    username: string,
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ code: number; msg: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const resp = await api.me();
    if (resp.code === 0) {
      setUser(resp.data.user);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const resp = await api.login(usernameOrEmail, password);
    if (resp.code === 0) {
      setUser(resp.data.user);
    }
    return { code: resp.code, msg: resp.msg };
  };

  const register = async (username: string, email: string, password: string, displayName: string) => {
    const resp = await api.register(username, email, password, displayName);
    if (resp.code === 0) {
      setUser(resp.data.user);
    }
    return { code: resp.code, msg: resp.msg };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, refreshMe, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
