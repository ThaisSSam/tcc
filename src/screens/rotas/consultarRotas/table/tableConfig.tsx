import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Star, MapPin, Fuel, Zap, Clock, Calendar, Eye, Trash2 } from 'lucide-react';

export interface SimulacaoRota {
  id: string;
  apelido?: string;
  origem: string;
  destino: string;
  veiculoNome: string;
  tipoPropulsao: 'combustao' | 'eletrico';
  distanciaKm: number;
  duracaoEstimada: string;
  custoDeslocamento: number;
  custoPedagio: number;
  custoTotal: number;
  tipoRota: 'principal' | 'sem_pedagio' | 'alternativa';
  isFavorita: boolean;
  dataSimulacao: string;
}

export const createRotaColumns = (
  onToggleFavorito: (id: string) => void,
  onVisualizar: (data: SimulacaoRota) => void,
  onExcluir: (data: SimulacaoRota) => void
): ColumnDef<any, any>[] => [
  {
    id: 'favorito',
    header: () => <span className="text-center block">Fav</span>,
    size: 70,
    enableResizing: false,
    cell: ({ row }: any) => (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onToggleFavorito(row.original.id)}
          className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <Star
            size={15}
            className={row.original.isFavorita ? 'text-amber-400 fill-amber-400' : ''}
          />
        </button>
      </div>
    ),
  },
  {
    id: 'acoes',
    header: () => <span className="text-center block">Ações</span>,
    size: 95,
    enableResizing: false,
    cell: ({ row }: any) => (
      <div className="flex justify-center items-center gap-1.5 whitespace-nowrap">
        <button
          onClick={() => onVisualizar(row.original)}
          title="Ver detalhes"
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={() => onExcluir(row.original)}
          title="Excluir simulação"
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ),
  },
  {
    accessorKey: 'trajeto',
    header: 'Trajeto (Origem → Destino)',
    size: 260,
    minSize: 200,
    maxSize: 400,
    cell: ({ row }: any) => {
      const trajetoCompleto = `${row.original.origem} → ${row.original.destino}`;
      return (
        <div className="w-full max-w-[280px] overflow-hidden" title={trajetoCompleto}>
          <div className="font-semibold text-slate-100 flex items-center gap-1.5 truncate">
            <MapPin size={14} className="text-blue-400 flex-shrink-0" />
            <span className="truncate">{row.original.origem}</span>
            <span className="text-slate-500 flex-shrink-0">→</span>
            <span className="truncate">{row.original.destino}</span>
          </div>
          {row.original.apelido && (
            <span className="text-[10px] text-slate-500 block truncate mt-0.5" title={row.original.apelido}>
              {row.original.apelido}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'veiculoNome',
    header: 'Veículo',
    size: 160,
    minSize: 130,
    maxSize: 250,
    cell: ({ row }: any) => (
      <div className="flex items-center gap-1.5 truncate max-w-[180px]" title={row.original.veiculoNome}>
        {row.original.tipoPropulsao === 'combustao' ? (
          <Fuel size={14} className="text-amber-400 flex-shrink-0" />
        ) : (
          <Zap size={14} className="text-emerald-400 flex-shrink-0" />
        )}
        <span className="truncate">{row.original.veiculoNome}</span>
      </div>
    ),
  },
  {
    accessorKey: 'distanciaKm',
    header: 'Distância / Tempo',
    size: 140,
    minSize: 120,
    maxSize: 200,
    cell: ({ row }: any) => (
      <div className="whitespace-nowrap">
        <span className="font-mono text-slate-200">{Number(row.original.distanciaKm).toFixed(1)} km</span>
        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
          <Clock size={11} className="flex-shrink-0" /> {row.original.duracaoEstimada}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'custoPedagio',
    header: 'Pedágio',
    size: 110,
    minSize: 90,
    maxSize: 160,
    cell: ({ row }: any) => (
      <span className="font-mono whitespace-nowrap">
        {Number(row.original.custoPedagio) > 0 ? (
          `R$ ${Number(row.original.custoPedagio).toFixed(2)}`
        ) : (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans font-medium">
            Isento
          </span>
        )}
      </span>
    ),
  },
  {
    accessorKey: 'custoTotal',
    header: 'Custo Total',
    size: 120,
    minSize: 100,
    maxSize: 180,
    cell: ({ row }: any) => (
      <span className="font-mono font-bold text-slate-100 whitespace-nowrap">
        R$ {Number(row.original.custoTotal).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'dataSimulacao',
    header: 'Data',
    size: 150,
    minSize: 105,
    maxSize: 150,
    cell: ({ row }: any) => (
      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs whitespace-nowrap">
        <Calendar size={13} className="text-slate-500 flex-shrink-0" />
        <span>{row.original.dataSimulacao}</span>
      </div>
    ),
  },
];