import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Zap, Fuel, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface RegistroGasto {
  id: string;
  data: string; // Formato YYYY-MM-DD
  origem: string;
  destino: string;
  veiculoApelido: string;
  tipoPropulsao: "combustao" | "eletrico";
  distanciaKm: number;
  custoCombustivel: number;
  custoPedagio: number;
  tipoRota: "principal" | "sem_pedagio";
  manutencaoNecessaria: boolean;
  tipoManutencao?: string;
}

export const gastosTableColumns: ColumnDef<RegistroGasto>[] = [
  {
    accessorKey: "data",
    header: "Data",
    size: 110,
    minSize: 90,
    maxSize: 150,
    cell: (info) => (
      <span className="text-slate-400 font-sans truncate">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "veiculoApelido",
    header: "Veículo",
    size: 160,
    minSize: 130,
    maxSize: 240,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-200 truncate">
        {row.original.tipoPropulsao === "eletrico" ? (
          <Zap size={13} className="text-emerald-400 flex-shrink-0" />
        ) : (
          <Fuel size={13} className="text-amber-400 flex-shrink-0" />
        )}
        <span className="truncate">{row.original.veiculoApelido}</span>
      </div>
    ),
  },
  {
    id: "trajeto",
    header: "Trajeto",
    size: 260,
    minSize: 200,
    maxSize: 450,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-sans text-slate-300 truncate">
        <span className="truncate">
          {row.original.origem} → {row.original.destino}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "distanciaKm",
    header: "Distância",
    size: 120,
    minSize: 100,
    maxSize: 180,
    cell: (info) => (
      <span className="font-mono text-slate-400 truncate">
        {info.getValue<number>().toFixed(1)} km
      </span>
    ),
  },
  {
    accessorKey: "custoCombustivel",
    header: "Combustível / Energia",
    size: 160,
    minSize: 130,
    maxSize: 230,
    cell: (info) => (
      <span className="font-mono text-emerald-400 font-semibold truncate">
        R$ {info.getValue<number>().toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "custoPedagio",
    header: "Pedágio",
    size: 120,
    minSize: 90,
    maxSize: 180,
    cell: (info) => {
      const val = info.getValue<number>();
      return (
        <span
          className={`font-mono truncate ${val > 0 ? "text-amber-400 font-semibold" : "text-slate-500"}`}
        >
          {val > 0 ? `R$ ${val.toFixed(2)}` : "Isento"}
        </span>
      );
    },
  },
  {
    id: "total",
    header: "Total",
    size: 130,
    minSize: 100,
    maxSize: 200,
    cell: ({ row }) => {
      const total = row.original.custoCombustivel + row.original.custoPedagio;
      return (
        <span className="font-mono font-bold text-white truncate">
          R$ {total.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "manutencaoNecessaria",
    header: "Status / Manutenção",
    size: 190,
    minSize: 140,
    maxSize: 280,
    cell: ({ row }) => (
      <div className="font-sans truncate">
        {row.original.manutencaoNecessaria ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 truncate">
            <AlertTriangle size={11} className="flex-shrink-0" />{" "}
            {row.original.tipoManutencao || "Revisão Necessária"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 truncate">
            <CheckCircle2
              size={11}
              className="text-emerald-400 flex-shrink-0"
            />{" "}
            Em dia
          </span>
        )}
      </div>
    ),
  },
];
