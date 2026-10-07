import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ApiError,
  getToken,
  setToken as saveToken,
  clearToken as removeToken,
  getStoredUser,
  setStoredUser,
  api,
} from "../services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatarUrl?: string;
  mentorProfile?: {
    headline?: string;
    bio?: string;
    expertise?: string[];
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isMentor: boolean;
  isAdmin: boolean;
  /** Human readable role label for UI chips ("Admin" | "Mentor" | "Student") */
  roleLabel: string;
  login: (token: string, user: User, remember?: boolean) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUserState] = useState<User | null>(getStoredUser());

  const login = (newToken: string, newUser: User, remember = true) => {
    saveToken(newToken, remember);
    setStoredUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  };

  /** Replace the stored user (e.g. after becoming a mentor) without touching the token. */
  const updateUser = (newUser: User) => {
    setStoredUser(newUser);
    setUserState(newUser);
  };

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await api.auth.getMe();
      if (res.user) {
        setStoredUser(res.user);
        setUserState(res.user);
      }
    } catch (err) {
      // Only an authentication failure should end the session. Network errors,
      // backend restarts and 5xx responses keep the user signed in.
      if (err instanceof ApiError && err.status === 401) {
        logout();
      }
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  const isMentor = !!user?.roles?.includes("mentor");
  const isAdmin = !!user?.roles?.includes("admin");
  const roleLabel = isAdmin ? "Admin" : isMentor ? "Mentor" : "Student";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isMentor,
        isAdmin,
        roleLabel,
        login,
        updateUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
