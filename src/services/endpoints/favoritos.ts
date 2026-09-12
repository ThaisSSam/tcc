import axios, { AxiosError } from 'axios';
import api from '../config';

export interface FavoritoRequestData {
  simulacao_id: string;
  apelido_rota?: string;
}

export interface FavoritoResponseSuccess {
  id: string;
  usuario_id: string;
  simulacao_id: string;
  apelido_rota?: string;
  data_criacao: string;
}

export interface ApiErrorResponse {
  errors?: string[] | Record<string, string[]>;
  mensagem?: string;
  message?: string;
}

export interface FavoritoEndpointResult<T> {
  data: T;
  success: boolean;
}

export interface AppHandledError extends Error {
  success: boolean;
}

const tratarErroRequisicao = (error: unknown, fallbackMessage: string): AppHandledError => {
  let mensagem = fallbackMessage;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const dadosErro = axiosError.response?.data;

    if (dadosErro?.mensagem) {
      mensagem = dadosErro.mensagem;
    } else if (dadosErro?.message) {
      mensagem = dadosErro.message;
    } else if (Array.isArray(dadosErro?.errors) && dadosErro.errors.length > 0) {
      mensagem = dadosErro.errors[0];
    } else if (axiosError.message) {
      mensagem = axiosError.message;
    }
  } else if (error instanceof Error) {
    mensagem = error.message;
  }

  const erroTratado = new Error(mensagem) as AppHandledError;
  erroTratado.success = false;
  return erroTratado;
};

export const favoritosEndpoints = {
  // POST /api/favoritos
  favoritarRota: async (corpoRequest: FavoritoRequestData): Promise<FavoritoEndpointResult<FavoritoResponseSuccess>> => {
    try {
      const response = await api.post<FavoritoResponseSuccess>('/api/favoritos', corpoRequest);
      return { data: response.data, success: true };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao favoritar o trajeto.');
    }
  },

  // DELETE /api/favoritos/{id}
  removerFavorito: async (idOuSimulacaoId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete<{ message?: string }>(`/api/favoritos/${idOuSimulacaoId}`);
      return {
        success: true,
        message: response.data?.message || 'Favorito removido com sucesso.',
      };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao remover favorito.');
    }
  },
};

export default favoritosEndpoints;