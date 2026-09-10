export type TipoCombustivel = 'gasolina' | 'diesel';

export interface PrecoCombustivelDetectado {
  postoNome: string;
  tipo: TipoCombustivel;
  preco: number;
  dataAtualizacao: string;
  fonte: string;
}

export interface TarifaEnergiaEV {
  modalidade: 'residencial' | 'eletroposto';
  precoKwh: number;
  descricao: string;
  fonte: string;
}

export const TARIFAS_ENERGIA_PADRAO: Record<'residencial' | 'eletroposto', TarifaEnergiaEV> = {
  residencial: {
    modalidade: 'residencial',
    precoKwh: 0.95,
    descricao: 'Recarga Doméstica (AC)',
    fonte: 'Tarifa Média Homologada ANEEL/SP',
  },
  eletroposto: {
    modalidade: 'eletroposto',
    precoKwh: 2.40,
    descricao: 'Eletroposto Rodoviário (DC Rápido)',
    fonte: 'Média Redes Privadas (Shell/Raízen/Tupinambá)',
  },
};

const PRECOS_FALLBACK: Record<TipoCombustivel, number> = {
  gasolina: 6.53,
  diesel: 6.88,
};

const parsePrecoBR = (valorStr?: string | number): number => {
  if (!valorStr) return 0;
  if (typeof valorStr === 'number') return valorStr;
  return parseFloat(valorStr.replace('.', '').replace(',', '.'));
};

export async function buscarPrecosCombustivelAPI(
  uf: string = 'sp',
  tipoDesejado: TipoCombustivel
): Promise<PrecoCombustivelDetectado> {
  const ufChave = (uf || 'sp').toLowerCase().trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://combustivelapi.com.br/api/precos/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();

    if (data && data.precos) {
      const dataFormatada = data.data_coleta
        ? data.data_coleta.split(' ')[0].split('-').reverse().join('/')
        : new Date().toLocaleDateString('pt-BR');

      let precoFinal = 0;

      if (tipoDesejado === 'gasolina' && data.precos.gasolina) {
        // Tenta pegar a UF desejada, se não achar tenta 'sp', senão a média 'br'
        const raw = data.precos.gasolina[ufChave] || data.precos.gasolina['sp'] || data.precos.gasolina['br'];
        precoFinal = parsePrecoBR(raw);
      } else if (tipoDesejado === 'diesel' && data.precos.diesel) {
        const raw = data.precos.diesel[ufChave] || data.precos.diesel['sp'] || data.precos.diesel['br'];
        precoFinal = parsePrecoBR(raw);
      }

      if (precoFinal > 0) {
        return {
          postoNome: `Média ${ufChave.toUpperCase()} (Petrobras)`,
          tipo: tipoDesejado,
          preco: precoFinal,
          dataAtualizacao: dataFormatada,
          fonte: 'Petrobras (Tempo Real)',
        };
      }
    }

    throw new Error('Preço não encontrado para a UF');
  } catch (error) {
    console.warn('Usando tabela de contingência:', error);
    return {
      postoNome: `Média ${ufChave.toUpperCase()} (Referência)`,
      tipo: tipoDesejado,
      preco: PRECOS_FALLBACK[tipoDesejado],
      dataAtualizacao: new Date().toLocaleDateString('pt-BR'),
      fonte: 'Petrobras (Referência)',
    };
  }
}