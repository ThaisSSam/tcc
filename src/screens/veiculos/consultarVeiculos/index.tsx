import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';
import {
  Car,
  Plus,
  Search,
  Fuel,
  Zap,
  Trash2,
  X,
} from 'lucide-react';
import { BaseDataTable } from '../../../contexts/BaseDataTable';
import { createVeiculoColumns, type Veiculo } from './table/tableConfig';

const VEICULOS_MOCK: Veiculo[] = [
  {
    id: '1',
    apelido: 'Carro do Trabalho',
    marca: 'Chevrolet',
    modelo: 'Onix 1.0 Turbo',
    anoFabricacao: 2023,
    tipoPropulsao: 'combustao',
    consumo: 13.5,
  },
  {
    id: '2',
    apelido: 'Meu Elétrico',
    marca: 'BYD',
    modelo: 'Dolphin Mini',
    anoFabricacao: 2024,
    tipoPropulsao: 'eletrico',
    consumo: 14.5,
    capacidadeBateria: 38.0,
    autonomiaKm: 280,
  },
  {
    id: '3',
    apelido: 'Carro de Viagem',
    marca: 'Toyota',
    modelo: 'Corolla Cross Hybrid',
    anoFabricacao: 2022,
    tipoPropulsao: 'combustao',
    consumo: 17.8,
  },
  {
    id: '4',
    apelido: 'SUV Elétrica',
    marca: 'Volvo',
    modelo: 'EX30',
    anoFabricacao: 2024,
    tipoPropulsao: 'eletrico',
    consumo: 16.2,
    capacidadeBateria: 69.0,
    autonomiaKm: 340,
  },
];

export default function ConsultarVeiculosScreen() {
  const navigate = useNavigate();

  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_MOCK);
  const [busca, setBusca] = useState('');
  const [filtroPropulsao, setFiltroPropulsao] = useState<'todos' | 'combustao' | 'eletrico'>('todos');

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  // Estados dos modais
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Filtragem
  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter((v) => {
      const matchBusca =
        v.modelo.toLowerCase().includes(busca.toLowerCase()) ||
        v.marca.toLowerCase().includes(busca.toLowerCase()) ||
        v.apelido.toLowerCase().includes(busca.toLowerCase());

      const matchPropulsao =
        filtroPropulsao === 'todos' ? true : v.tipoPropulsao === filtroPropulsao;

      return matchBusca && matchPropulsao;
    });
  }, [veiculos, busca, filtroPropulsao]);

  // Ações
  const handleVisualizar = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo);
    setModalVisualizarAberto(true);
  };

  const handleEditar = (id: string) => {
    navigate(`/veiculos/editar/${id}`);
  };

  const handleAbrirExclusao = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo);
    setModalExcluirAberto(true);
  };

  const confirmarExclusao = () => {
    if (veiculoSelecionado) {
      setVeiculos((prev) => prev.filter((v) => v.id !== veiculoSelecionado.id));
      setModalExcluirAberto(false);
      setVeiculoSelecionado(null);
    }
  };

  // Definição das colunas
  const columns = useMemo(
    () => createVeiculoColumns(handleVisualizar, handleEditar, handleAbrirExclusao),
    [veiculos]
  );

  // Instanciação correta da tabela no TanStack Table v8
  const table = useReactTable({
    data: veiculosFiltrados,
    columns,
    columnResizeMode: 'onChange',
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  } as any);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-slate-800 bg-[#0f172a] px-8 py-5 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Car size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 leading-tight">Garagem de Veículos</h1>
            <p className="text-xs text-slate-500">Gerencie seus veículos para cálculo de rotas</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/veiculos/cadastro')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-xs shadow-lg shadow-blue-500/10 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Cadastrar Veículo
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-h-0 p-6 bg-[#090d16] space-y-4 overflow-hidden">
        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap gap-3 items-center justify-between flex-shrink-0">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo ou apelido..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#131b2e] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* SELETOR DE PROPULSÃO */}
          <div className="flex items-center bg-[#131b2e] border border-slate-800 rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setFiltroPropulsao('todos')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filtroPropulsao === 'todos'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFiltroPropulsao('combustao')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                filtroPropulsao === 'combustao'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fuel size={13} />
              Combustão
            </button>
            <button
              type="button"
              onClick={() => setFiltroPropulsao('eletrico')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                filtroPropulsao === 'eletrico'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={13} />
              Elétrico
            </button>
          </div>

          {(busca || filtroPropulsao !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setBusca('');
                setFiltroPropulsao('todos');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* CONTAINER DA TABELA BASE */}
        <div className="rounded-xl border border-slate-800 bg-[#131b2e] flex-1 min-h-0 overflow-hidden">
          <BaseDataTable
            table={table}
            isLoading={false}
            enablePagination={true}
            enableColumnResizing={true}
            alturaAutomatica={false}
            rolagemHorizontalExterna={false}
          />
        </div>
      </main>

      {/* MODAL DE VISUALIZAR */}
      {modalVisualizarAberto && veiculoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Car size={18} className="text-blue-500" />
                Detalhes do Veículo
              </h3>
              <button
                onClick={() => setModalVisualizarAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Apelido:</span>
                <span className="font-semibold text-slate-100">{veiculoSelecionado.apelido}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Marca / Modelo:</span>
                <span className="font-semibold text-slate-100">{veiculoSelecionado.marca} {veiculoSelecionado.modelo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Ano de Fabricação:</span>
                <span className="font-semibold text-slate-100">{veiculoSelecionado.anoFabricacao}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Tipo de Propulsão:</span>
                <span className="capitalize font-semibold text-slate-100">{veiculoSelecionado.tipoPropulsao}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Consumo Médio:</span>
                <span className="font-mono font-semibold text-blue-400">
                  {veiculoSelecionado.tipoPropulsao === 'combustao'
                    ? `${veiculoSelecionado.consumo} km/l`
                    : `${veiculoSelecionado.consumo} kWh/100km`}
                </span>
              </div>

              {veiculoSelecionado.tipoPropulsao === 'eletrico' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Capacidade da Bateria:</span>
                    <span className="font-semibold text-slate-100">{veiculoSelecionado.capacidadeBateria} kWh</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Autonomia Estimada:</span>
                    <span className="font-semibold text-emerald-400">{veiculoSelecionado.autonomiaKm} km</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalVisualizarAberto(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {modalExcluirAberto && veiculoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 text-rose-500">
              <Trash2 size={18} />
              Confirmar Exclusão
            </h3>
            <p className="text-xs text-slate-400">
              Tem certeza que deseja excluir o veículo <strong>{veiculoSelecionado.apelido}</strong> ({veiculoSelecionado.modelo})? Esta ação não poderá ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setModalExcluirAberto(false);
                  setVeiculoSelecionado(null);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}