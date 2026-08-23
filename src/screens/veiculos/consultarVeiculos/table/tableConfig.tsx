import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Car, Fuel, Zap, Eye, Edit, Trash2 } from 'lucide-react';

export interface Veiculo {
  id: string;
  apelido: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  tipoPropulsao: 'combustao' | 'eletrico';
  consumo: number; 
  capacidadeBateria?: number;
  autonomiaKm?: number;
}

export const createVeiculoColumns = (
  onVisualizar: (data: Veiculo) => void,
  onEditar: (id: string) => void,
  onExcluir: (data: Veiculo) => void
): ColumnDef<any, any>[] => [
  {
    id: 'acoes',
    header: () => <span className="text-center block">Ações</span>,
    size: 150,
    enableResizing: false,
    cell: ({ row }: any) => (
      <div className="flex justify-center items-center gap-1.5 whitespace-nowrap">
        <button
          onClick={() => onVisualizar(row.original)}
          title="Visualizar detalhes"
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={() => onEditar(row.original.id)}
          title="Editar veículo"
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <Edit size={15} />
        </button>
        <button
          onClick={() => onExcluir(row.original)}
          title="Excluir veículo"
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ),
  },
  {
    accessorKey: 'apelido',
    header: 'Apelido',
    size: 200,
    minSize: 150,
    maxSize: 300,
    cell: ({ row }: any) => (
      <div className="font-semibold text-slate-100 flex items-center gap-2 truncate" title={row.original.apelido}>
        <Car size={15} className="text-slate-500 flex-shrink-0" />
        <span className="truncate">{row.original.apelido}</span>
      </div>
    ),
  },
  {
    accessorKey: 'marcaModelo',
    header: 'Marca & Modelo',
    size: 220,
    minSize: 180,
    maxSize: 320,
    cell: ({ row }: any) => {
      const nomeCompleto = `${row.original.marca} ${row.original.modelo}`;
      return (
        <span className="truncate block" title={nomeCompleto}>
          {nomeCompleto}
        </span>
      );
    },
  },
  {
    accessorKey: 'anoFabricacao',
    header: 'Ano',
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }: any) => (
      <span className="text-slate-400 font-mono">
        {row.original.anoFabricacao}
      </span>
    ),
  },
  {
    accessorKey: 'tipoPropulsao',
    header: 'Propulsão',
    size: 150,
    minSize: 130,
    maxSize: 180,
    cell: ({ row }: any) => (
      <div className="whitespace-nowrap">
        {row.original.tipoPropulsao === 'combustao' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Fuel size={12} className="flex-shrink-0" /> Combustão
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap size={12} className="flex-shrink-0" /> Elétrico
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'consumo',
    header: 'Consumo Médio',
    size: 160,
    minSize: 140,
    maxSize: 200,
    cell: ({ row }: any) => (
      <span className="font-mono text-slate-200 whitespace-nowrap">
        {row.original.tipoPropulsao === 'combustao'
          ? `${Number(row.original.consumo).toFixed(1)} km/l`
          : `${Number(row.original.consumo).toFixed(1)} kWh/100km`}
      </span>
    ),
  },
];