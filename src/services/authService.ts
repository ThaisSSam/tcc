import axios, { AxiosError } from 'axios';
import api from '../services/config';

export interface LoginRequestData {
  Email: string;
  Senha: string;
  LembrarAcesso: boolean;
}

export interface LoginResponseSuccess {
  message: string;
  token: string;
}

export interface ApiErrorResponse {
  errors?: string[];
  message?: string;
}

export interface LoginEndpointResult {
  data: LoginResponseSuccess;
  success: boolean;
}

export interface RecoveryEndpointResult {
  success: boolean;
  message: string;
}

export interface AppHandledError extends Error {
  success: boolean;
}

export const loginEndpoints = {
  executarLogin: async (corpoRequest: LoginRequestData): Promise<LoginEndpointResult> => {
    try {
      const response = await api.post<LoginResponseSuccess>('/usuarios/login?api-version=1', corpoRequest);
      return { data: response.data, success: true };
    } catch (error: unknown) {
      let mensagem = 'Erro ao tentar realizar o login.';

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        mensagem = axiosError.response?.data?.errors?.[0] || axiosError.message || mensagem;
      } else if (error instanceof Error) {
        mensagem = error.message;
      }

      const erroTratado = new Error(mensagem) as AppHandledError;
      erroTratado.success = false;
      throw erroTratado;
    }
  },

  solicitarRecuperacao: async (login: string): Promise<RecoveryEndpointResult> => {
    try {
      const response = await api.post<{ success?: boolean; message?: string }>('/api/v1/auth/esqueci-senha', { login: login.trim() });
      return {
        success: response.data?.success ?? true,
        message: response.data?.message || 'Link de recuperação enviado com sucesso.',
      };
    } catch (error: unknown) {
      let mensagem = 'Erro ao solicitar recuperação.';

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        mensagem = axiosError.response?.data?.errors?.[0] || axiosError.message;
      } else if (error instanceof Error) {
        mensagem = error.message;
      }

      throw new Error(mensagem);
    }
  },

  executarLogout: async (): Promise<{ success: boolean }> => {
    try {
      await api.post('/usuarios/logout?api-version=1');
      return { success: true };
    } catch {
      return { success: false };
    }
  }
};

export default loginEndpoints;