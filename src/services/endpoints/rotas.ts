import axios, { AxiosError } from 'axios';
import api from '../config';

// Interface enviada ao salvar a simulação da viagem
export interface SimulacaoRequestData {
  veiculo_id: string;
  origem_endereco: string;
  destino_endereco: string;
  distancia_km: number;
  duracao_segundos: number;
  preco_referencia: number;
  custo_energia_combustivel: number;
  custo_pedagio: number;
  custo_total: number;
  tipo_rota?: 'principal' | 'sem_pedagio' | 'alternativa';
  provedor_rota?: string;
  dados_rota_json?: Record<string, any>;
}

// Interface retornada pela API e consumida pela TanStack Table
export interface SimulacaoRotaDTO {
  id: string;
  apelido?: string;
  origem: string;
  destino: string;
  veiculoNome: string;
  tipoPropulsao: 'combustao' | 'eletrico' | 'hibrido';
  distanciaKm: number;
  duracaoEstimada: string;
  custoDeslocamento: number;
  custoPedagio: number;
  custoTotal: number;
  tipoRota: 'principal' | 'sem_pedagio' | 'alternativa';
  isFavorita: boolean;
  dataSimulacao: string;
}

export interface ApiErrorResponse {
  errors?: string[] | Record<string, string[]>;
  mensagem?: string;
  message?: string;
}

export interface RotaEndpointResult<T> {
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

export const rotasEndpoints = {
  // GET /api/simulacoes
  listar: async (): Promise<RotaEndpointResult<SimulacaoRotaDTO[]>> => {
    try {
      const response = await api.get<SimulacaoRotaDTO[]>('/api/simulacoes');
      return { data: response.data, success: true };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao carregar o histórico de rotas.');
    }
  },

  // POST /api/simulacoes
  salvarSimulacao: async (corpoRequest: SimulacaoRequestData): Promise<RotaEndpointResult<any>> => {
    try {
      const response = await api.post('/api/simulacoes', corpoRequest);
      return { data: response.data, success: true };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao salvar a simulação de viagem.');
    }
  },

  // DELETE /api/simulacoes/{id}
  excluir: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`/api/simulacoes/${id}`);
      return { success: true, message: 'Simulação excluída com sucesso.' };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao remover a simulação.');
    }
  },
};

export default rotasEndpoints;