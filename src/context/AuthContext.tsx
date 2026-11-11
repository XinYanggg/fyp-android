import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { api } from '../services/api';

// Web OAuth client ID (same as GOOGLE_CLIENT_ID on the website). Needed so the
// ID token's audience matches what the backend verifies.
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

const TOKEN_KEY = 'dh_auth_token';
const USER_KEY = 'dh_auth_user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isServerOnline: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; cancelled?: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; isVerified?: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  checkServerStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(false);

  const checkServerStatus = async (): Promise<boolean> => {
    const online = await api.ping();
    setIsServerOnline(online);
    return online;
  };

  // Restore stored session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await checkServerStatus();

        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUserJson = await SecureStore.getItemAsync(USER_KEY);

        if (storedToken) {
          api.setToken(storedToken);
          setToken(storedToken);

          if (storedUserJson) {
            try {
              setUser(JSON.parse(storedUserJson));
            } catch {
              // ignore json parse error
            }
          }

          // Verify with backend
          try {
            const data = await api.getMe();
            if (data?.user) {
              setUser(data.user);
              await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
            }
          } catch {
            // Server might be offline, keep local user
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await api.login(email, password);
      api.setToken(data.token);
      setToken(data.token);
      setUser(data.user);

      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; cancelled?: boolean; error?: string }> => {
    try {
      GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();

      if (result.type !== 'success') {
        return { success: false, cancelled: true };
      }

      const idToken = result.data.idToken;
      if (!idToken) {
        return { success: false, error: 'Google did not return an ID token.' };
      }

      const data = await api.googleLogin(idToken);
      api.setToken(data.token);
      setToken(data.token);
      setUser(data.user);

      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, cancelled: true };
      }
      return { success: false, error: err?.message || 'Google sign-in failed.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; isVerified?: boolean; message?: string; error?: string }> => {
    try {
      const data = await api.register(name, email, password);

      return {
        success: true,
        isVerified: false,
        message: data.message || 'Signup successful! Please check your email to verify your account.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch {
      // not signed in with Google
    }
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {
      // ignore deletion errors
    }
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isServerOnline,
        login,
        loginWithGoogle,
        register,
        logout,
        checkServerStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

