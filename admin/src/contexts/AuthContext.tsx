'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser,
  getMe,
  login as authLogin,
  logout as authLogout,
} from '@/services/auth.service';
import type { AuthResponse, UserSession } from '@/types/auth';
import { TOKEN_KEY } from '@/lib/constants';

export interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<UserSession>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const storedUser = getStoredUser();
      if (!cancelled && storedUser) {
        setUser(storedUser);
      }

      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          authLogout();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authLogin(email, password);
      setUser(res.user);
      router.push('/dashboard');
      return res;
    },
    [router]
  );

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch {
      authLogout();
      setUser(null);
      throw new Error('Sessão inválida');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
