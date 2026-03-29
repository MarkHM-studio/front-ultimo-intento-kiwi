import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AuthMeResponse, 
  LoginRequest, 
  UsuarioClienteRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyResetTokenRequest,
  VerifyResetTokenResponse,
  ResetPasswordRequest,
  PasswordResetResponse,
  RolNombre
} from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  // Estado
  user: AuthMeResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: UsuarioClienteRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  fetchCurrentUser: () => Promise<void>;
  hasRole: (roles: RolNombre[]) => boolean;
  
  // Recuperación de contraseña
  forgotPassword: (data: ForgotPasswordRequest) => Promise<ForgotPasswordResponse>;
  verifyResetToken: (data: VerifyResetTokenRequest) => Promise<VerifyResetTokenResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<PasswordResetResponse>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({ 
            token: response.token, 
            isAuthenticated: true,
            isLoading: false 
          });
          // Fetch user data after login
          await get().fetchCurrentUser();
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al iniciar sesión',
            isLoading: false 
          });
          throw error;
        }
      },

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({ 
            token: response.token, 
            isAuthenticated: true,
            isLoading: false 
          });
          // Fetch user data after register
          await get().fetchCurrentUser();
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al registrar usuario',
            isLoading: false 
          });
          throw error;
        }
      },

      // Logout
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Fetch current user
      fetchCurrentUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true /*Agregó esto*/ });
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      },

      // Check if user has any of the given roles
      hasRole: (roles: RolNombre[]) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.rol);
      },

      // Forgot password
      forgotPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.forgotPassword(data);
          set({ isLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al solicitar recuperación',
            isLoading: false 
          });
          throw error;
        }
      },

      // Verify reset token
      verifyResetToken: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyResetToken(data);
          set({ isLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Token inválido',
            isLoading: false 
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.resetPassword(data);
          set({ isLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al restablecer contraseña',
            isLoading: false 
          });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated, user: state.user /*AGREGAR ESTO*/ })
    }
  )
);
