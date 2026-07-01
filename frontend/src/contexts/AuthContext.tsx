import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  authApi,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
  type AuthUser,
  type County,
  type RegisterDetailsRequest,
  type UpdateProfileRequest,
} from '../services/api';

export interface User extends AuthUser {
  email?: string;
  token?: string;
  farmerProfile?: unknown;
  buyerProfile?: unknown;
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFarmer: boolean;
  isBuyer: boolean;
  login: (value: any, otp?: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  registerDetails: (payload: RegisterDetailsRequest) => Promise<User | null>;
  updateUser: (userData: Partial<User> | UpdateProfileRequest) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  loading: true,
  isAuthenticated: false,
  isFarmer: false,
  isBuyer: false,
  login: async () => null,
  logout: () => undefined,
  refreshUser: async () => undefined,
  registerDetails: async () => null,
  updateUser: () => undefined,
});

export const useAuth = () => useContext(AuthContext);

const readStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? (JSON.parse(storedUser) as User) : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAuthToken();
      const storedUser = readStoredUser();

      if (token && storedUser) {
        persistUser(storedUser);
      }

      if (token) {
        try {
          setAuthToken(token);
          const response = await authApi.me();
          persistUser(response.user as User);
          return;
        } catch {
          clearAuthToken();
          persistUser(null);
        }
      }

      setLoading(false);
    };

    bootstrap().finally(() => setLoading(false));
  }, []);

  const login = async (value: any, otp?: string) => {
    if (typeof value === 'string' && otp === undefined) {
      return authApi.sendOtp({ phone: value });
    }

    if (typeof value === 'string' && typeof otp === 'string') {
      const result = await authApi.verifyOtp({ phone: value, otp });
      setAuthToken(result.token);
      persistUser(result.user as User);
      return result;
    }

    const userData = value as User;
    persistUser(userData);
    if (userData.token) {
      setAuthToken(userData.token);
    }
    return userData;
  };

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) return;
    const response = await authApi.me();
    persistUser(response.user as User);
  };

  const registerDetails = async (payload: RegisterDetailsRequest) => {
    const result = await authApi.registerDetails(payload);
    await refreshUser();
    return result.user as User;
  };

  const logout = () => {
    clearAuthToken();
    persistUser(null);
  };

  const updateUser = (userData: Partial<User> | UpdateProfileRequest) => {
    setUser((previous) => {
      if (!previous) return previous;
      const updated = { ...previous, ...userData } as User;
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = useMemo(() => Boolean(getAuthToken() && user), [user]);
  const isFarmer = user?.role === 'FARMER';
  const isBuyer = user?.role === 'BUYER';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        isAuthenticated,
        isFarmer,
        isBuyer,
        login,
        logout,
        refreshUser,
        registerDetails,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

