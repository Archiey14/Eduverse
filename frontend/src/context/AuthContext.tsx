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

/* =========================================================
   USER TYPE
========================================================= */

export interface User {
  id: string;
  name: string;
  email: string;

  /*
   * A user can have multiple roles.
   *
   * Examples:
   * ["student"]
   * ["mentor"]
   * ["admin"]
   * ["student", "admin"]
   * ["mentor", "admin"]
   */
  roles: string[];

  avatarUrl?: string;

  createdAt?: string;

  mentorProfile?: {
    headline?: string;
    bio?: string;
    expertise?: string[];
  };
}

/* =========================================================
   AUTH CONTEXT TYPE
========================================================= */

interface AuthContextType {
  user: User | null;
  token: string | null;

  isAuthenticated: boolean;

  isMentor: boolean;
  isAdmin: boolean;

  roleLabel: string;

  login: (
    token: string,
    user: User,
    remember?: boolean
  ) => void;

  updateUser: (user: User) => void;

  logout: () => void;

  refreshUser: () => Promise<void>;
}

/* =========================================================
   CONTEXT
========================================================= */

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/* =========================================================
   AUTH PROVIDER
========================================================= */

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  /* -------------------------------------------------------
     INITIAL AUTH STATE
  ------------------------------------------------------- */

  const [token, setTokenState] = useState<string | null>(
    getToken()
  );

  const [user, setUserState] = useState<User | null>(
    getStoredUser()
  );

  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  const login = (
    newToken: string,
    newUser: User,
    remember = true
  ) => {
    saveToken(newToken, remember);

    setStoredUser(newUser);

    setTokenState(newToken);
    setUserState(newUser);
  };

  /* -------------------------------------------------------
     UPDATE USER
  ------------------------------------------------------- */

  const updateUser = (newUser: User) => {
    setStoredUser(newUser);
    setUserState(newUser);
  };

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  const logout = useCallback(() => {
    removeToken();

    setTokenState(null);
    setUserState(null);
  }, []);

  /* -------------------------------------------------------
     REFRESH CURRENT USER
     
     IMPORTANT:
     This gets the latest user directly from the backend.

     This means if Archie changes your role in MongoDB from:

     ["student"]

     to:

     ["student", "admin"]

     the frontend can receive the new role without
     requiring the old stored user information.
  ------------------------------------------------------- */

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();

    if (!currentToken) {
      return;
    }

    try {
      const response = await api.auth.getMe();

      console.log(
        "[AuthContext] Current user from backend:",
        response.user
      );

      if (response.user) {
        /*
         * Always replace the old stored user with the
         * latest backend user.
         */
        setStoredUser(response.user);

        setUserState(response.user);
      }
    } catch (error) {
      console.error(
        "[AuthContext] Failed to refresh user:",
        error
      );

      /*
       * Only logout when authentication is actually invalid.
       */
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        logout();
      }
    }
  }, [logout]);

  /* -------------------------------------------------------
     REFRESH USER WHEN TOKEN EXISTS
     
     This runs when the application starts and whenever
     the token changes.
  ------------------------------------------------------- */

  useEffect(() => {
    if (!token) {
      return;
    }

    refreshUser();
  }, [token, refreshUser]);

  /* =======================================================
     ROLE CHECKS
  ======================================================= */

  /*
   * Make sure roles is always an array.
   *
   * This prevents errors if an older stored user object
   * does not contain roles.
   */

  const roles = Array.isArray(user?.roles)
    ? user.roles
    : [];

  /* -------------------------------------------------------
     MENTOR
  ------------------------------------------------------- */

  const isMentor = roles.includes("mentor");

  /* -------------------------------------------------------
     ADMIN
  ------------------------------------------------------- */

  const isAdmin = roles.includes("admin");

  /* -------------------------------------------------------
     ROLE LABEL
  ------------------------------------------------------- */

  const roleLabel = isAdmin
    ? "Admin"
    : isMentor
    ? "Mentor"
    : "Student";

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,

        isAuthenticated:
          !!user && !!token,

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

/* =========================================================
   USE AUTH HOOK
========================================================= */

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};