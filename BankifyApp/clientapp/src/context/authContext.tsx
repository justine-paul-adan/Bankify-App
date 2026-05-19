import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { BankifyUserDto } from "../models/bankifyUser";

type AuthContextType = {
  user: BankifyUserDto | null;
  setUser: (user: BankifyUserDto | null) => void;
  logout: (showModal?: boolean) => void;
  sessionExpired: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  USER: "bankify_user",
  TOKEN: "token",
  LAST_ACTIVITY: "bankify_last_activity",
};

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<BankifyUserDto | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const userRef = useRef<BankifyUserDto | null>(null);
  const lastUpdateRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  // Keep ref in sync
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const clearIdleTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const logout = useCallback((showModal = false) => {
    clearIdleTimer();
    setUserState(null);
    setSessionExpired(showModal);

    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  }, [clearIdleTimer]);

  const expireSession = useCallback(() => {
    if (userRef.current) {
      logout(true);
    }
  }, [logout]);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();
    timeoutRef.current = window.setTimeout(() => {
      expireSession();
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimer, expireSession]);

  const updateLastActivity = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    resetIdleTimer();
  }, [resetIdleTimer]);

  const handleUserActivity = useCallback(() => {
    const now = Date.now();

    // throttle (1 second)
    if (now - lastUpdateRef.current > 1000) {
      lastUpdateRef.current = now;

      if (userRef.current) {
        updateLastActivity();
      }
    }
  }, [updateLastActivity]);

  // Initial load
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as BankifyUserDto;
        setUserState(parsedUser);

        if (lastActivity) {
          const lastTime = Number(lastActivity);

          if (
            !Number.isNaN(lastTime) &&
            Date.now() - lastTime >= IDLE_TIMEOUT_MS
          ) {
            logout(true);
            return;
          }
        }

        updateLastActivity();
      } catch {
        logout();
      }
    }
    setIsLoading(false); // ✅ IMPORTANT
  }, [logout, updateLastActivity]);

  // Activity + cross-tab sync
  useEffect(() => {
    if (!user) {
      clearIdleTimer();
      return;
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity);
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.LAST_ACTIVITY && event.newValue) {
        const lastTime = Number(event.newValue);

        if (
          !Number.isNaN(lastTime) &&
          Date.now() - lastTime >= IDLE_TIMEOUT_MS
        ) {
          expireSession();
        }
      }

      if (event.key === STORAGE_KEYS.USER && event.newValue === null) {
        logout();
      }
    };

    window.addEventListener("storage", handleStorage);

    resetIdleTimer();

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      window.removeEventListener("storage", handleStorage);
      clearIdleTimer();
    };
  }, [user, handleUserActivity, expireSession, logout, resetIdleTimer, clearIdleTimer]);

  const setUser = (userData: BankifyUserDto | null) => {
    setUserState(userData);
    setSessionExpired(false);

    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      updateLastActivity();
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
      clearIdleTimer();
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, sessionExpired, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Wrap app with AuthProvider");
  }
  return context;
};
