import api from './api';
import type { 
  LoginRequest, 
  LoginResponse, 
  UsuarioClienteRequest,
  RegisterResponse,
  AuthMeResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyResetTokenRequest,
  VerifyResetTokenResponse,
  ResetPasswordRequest,
  PasswordResetResponse
} from '@/types';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (data: UsuarioClienteRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthMeResponse> => {
    const response = await api.get<AuthMeResponse>('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  // Verify reset token
  verifyResetToken: async (data: VerifyResetTokenRequest): Promise<VerifyResetTokenResponse> => {
    const response = await api.post<VerifyResetTokenResponse>('/auth/verify-reset-token', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<PasswordResetResponse> => {
    const response = await api.post<PasswordResetResponse>('/auth/reset-password', data);
    return response.data;
  },

  // Google OAuth (mock/simulated)
  loginWithGoogle: async (token: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/google', { token });
    return response.data;
  }
};

export default authService;
