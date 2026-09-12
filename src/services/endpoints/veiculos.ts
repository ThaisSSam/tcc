import axios, { AxiosError } from 'axios';
import api from '../config';

// Tipagem base de um veículo (alinhada com o modelo da API/MySQL)
export interface VeiculoDTO {
  id?: string;
  usuarioId?: string;
  usuario_id?: string;
  apelido: string;
  marca: string;
  modelo: string;
  anoFabricacao?: number;
  ano_fabricacao?: number;
  tipoPropulsao?: 'combustao' | 'eletrico' | 'hibrido';
  tipo_propulsao?: 'combustao' | 'eletrico' | 'hibrido';
  consumoKml?: number | null;
  consumo_kml?: number | null;
  consumoKwh100km?: number | null;
  consumo_kwh_100km?: number | null;
  capacidadeBateriaKwh?: number | null;
  capacidade_bateria_kwh?: number | null;
  autonomiaKm?: number | null;
  autonomia_km?: number | null;
  fonteConsumo?: string;
  fonte_consumo?: string;
  dataAtualizacao?: string;
  data_atualizacao?: string;
}

export interface ApiErrorResponse {
  errors?: string[] | Record<string, string[]>;
  mensagem?: string;
  message?: string;
}

export interface VeiculoEndpointResult<T> {
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

export const veiculosEndpoints = {
  // GET /api/veiculos
  listar: async (): Promise<VeiculoEndpointResult<VeiculoDTO[]>> => {
    try {
      const response = await api.get<VeiculoDTO[]>('/api/veiculos');
      return { data: response.data, success: true };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao carregar a lista de veículos.');
    }
  },

  // POST /api/veiculos
  cadastrar: async (veiculo: Partial<VeiculoDTO>): Promise<VeiculoEndpointResult<VeiculoDTO>> => {
    try {
      const response = await api.post<VeiculoDTO>('/api/veiculos', veiculo);
      return { data: response.data, success: true };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao cadastrar o veículo.');
    }
  },

  // PUT /api/veiculos/{id}
  atualizar: async (id: string, veiculo: Partial<VeiculoDTO>): Promise<VeiculoEndpointResult<VeiculoDTO>> => {
    try {
      const response = await api.put<VeiculoDTO>(`/api/veiculos/${id}`, veiculo);
      return { data: response.data, success: true };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao atualizar o veículo.');
    }
  },

  // DELETE /api/veiculos/{id}
  excluir: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`/api/veiculos/${id}`);
      return { success: true, message: 'Veículo excluído com sucesso.' };
    } catch (error: unknown) {
      throw tratarErroRequisicao(error, 'Erro ao excluir o veículo.');
    }
  },
};

export default veiculosEndpoints;