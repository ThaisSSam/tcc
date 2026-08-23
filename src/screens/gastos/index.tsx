import React, { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import {
  DollarSign,
  TrendingDown,
  Fuel,
  Coins,
  Wrench,
  Download,
  Calendar,
  Car,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { BaseDataTable } from "../../contexts/BaseDataTable";
import { gastosTableColumns, type RegistroGasto } from "./table/tableConfig";

interface AlertaManutencao {
  id: string;
  veiculoApelido: string;
  titulo: string;
  limiteKm: number;
  kmAtual: number;
  status: "urgente" | "atencao" | "ok";
}

const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const REGISTROS_MOCK: RegistroGasto[] = [
  // Agosto 2026
  {
    id: "1",
    data: "2026-08-20",
    origem: "Birigui, SP",
    destino: "São Paulo, SP",
    veiculoApelido: "Onix 1.0 Turbo",
    tipoPropulsao: "combustao",
    distanciaKm: 512.4,
    custoCombustivel: 223.5,
    custoPedagio: 99.8,
    tipoRota: "principal",
    manutencaoNecessaria: true,
    tipoManutencao: "Troca de Óleo Próxima",
  },
  {
    id: "2",
    data: "2026-08-18",
    origem: "Campinas, SP",
    destino: "Santos, SP",
    veiculoApelido: "Dolphin Mini",
    tipoPropulsao: "eletrico",
    distanciaKm: 178.2,
    custoCombustivel: 24.55,
    custoPedagio: 0,
    tipoRota: "sem_pedagio",
    manutencaoNecessaria: false,
  },
  {
    id: "3",
    data: "2026-08-15",
    origem: "Birigui, SP",
    destino: "São José do Rio Preto, SP",
    veiculoApelido: "Corolla Cross",
    tipoPropulsao: "combustao",
    distanciaKm: 124.0,
    custoCombustivel: 41.08,
    custoPedagio: 18.5,
    tipoRota: "principal",
    manutencaoNecessaria: false,
  },
  // Julho 2026
  {
    id: "4",
    data: "2026-07-28",
    origem: "Ribeirão Preto, SP",
    destino: "São Paulo, SP",
    veiculoApelido: "Dolphin Mini",
    tipoPropulsao: "eletrico",
    distanciaKm: 315.0,
    custoCombustivel: 43.4,
    custoPedagio: 62.3,
    tipoRota: "principal",
    manutencaoNecessaria: false,
  },
  {
    id: "5",
    data: "2026-07-14",
    origem: "Birigui, SP",
    destino: "Bauru, SP",
    veiculoApelido: "Onix 1.0 Turbo",
    tipoPropulsao: "combustao",
    distanciaKm: 210.0,
    custoCombustivel: 91.5,
    custoPedagio: 42.0,
    tipoRota: "principal",
    manutencaoNecessaria: false,
  },
  // Junho 2026
  {
    id: "6",
    data: "2026-06-22",
    origem: "São Paulo, SP",
    destino: "Ubatuba, SP",
    veiculoApelido: "Corolla Cross",
    tipoPropulsao: "combustao",
    distanciaKm: 228.0,
    custoCombustivel: 75.4,
    custoPedagio: 32.8,
    tipoRota: "principal",
    manutencaoNecessaria: true,
    tipoManutencao: "Revisão de Pastilhas",
  },
  // Março 2026
  {
    id: "7",
    data: "2026-03-12",
    origem: "Birigui, SP",
    destino: "Araçatuba, SP",
    veiculoApelido: "Onix 1.0 Turbo",
    tipoPropulsao: "combustao",
    distanciaKm: 32.0,
    custoCombustivel: 14.5,
    custoPedagio: 0,
    tipoRota: "sem_pedagio",
    manutencaoNecessaria: false,
  },
  // Dezembro 2025
  {
    id: "8",
    data: "2025-12-20",
    origem: "São Paulo, SP",
    destino: "Curitiba, PR",
    veiculoApelido: "Corolla Cross",
    tipoPropulsao: "combustao",
    distanciaKm: 408.0,
    custoCombustivel: 135.2,
    custoPedagio: 48.0,
    tipoRota: "principal",
    manutencaoNecessaria: false,
  },
];

const ALERTAS_MANUTENCAO_MOCK: AlertaManutencao[] = [
  {
    id: "1",
    veiculoApelido: "Onix 1.0 Turbo",
    titulo: "Troca de Óleo e Filtro",
    limiteKm: 10000,
    kmAtual: 9650,
    status: "urgente",
  },
  {
    id: "2",
    veiculoApelido: "Corolla Cross",
    titulo: "Revisão de Pastilhas de Freio",
    limiteKm: 20000,
    kmAtual: 16800,
    status: "atencao",
  },
  {
    id: "3",
    veiculoApelido: "Dolphin Mini",
    titulo: "Inspeção do Sistema Elétrico / Pneus",
    limiteKm: 15000,
    kmAtual: 4200,
    status: "ok",
  },
];

export default function GastosScreen() {
  const [filtroVeiculo, setFiltroVeiculo] = useState<string>("todos");
  const [sorting, setSorting] = useState<SortingState>([]);
  const carrosselRef = useRef<HTMLDivElement>(null);

  // Períodos com dados, ordenados do mais recente para o mais antigo
  const periodosDisponiveis = useMemo(() => {
    const chavesUnicas = new Set<string>();

    REGISTROS_MOCK.forEach((r) => {
      const chave = r.data.substring(0, 7);
      chavesUnicas.add(chave);
    });

    return Array.from(chavesUnicas)
      .sort((a, b) => b.localeCompare(a))
      .map((chave) => {
        const [ano, mesStr] = chave.split("-");
        const mesIndex = parseInt(mesStr, 10) - 1;
        const nomeMes = NOMES_MESES[mesIndex];
        const abrev = nomeMes.substring(0, 3);
        return {
          chave,
          ano,
          mes: mesStr,
          nomeCompleto: `${nomeMes} de ${ano}`,
          labelPill: `${abrev}/${ano}`,
        };
      });
  }, []);

  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>(
    periodosDisponiveis[0]?.chave || "2026-08",
  );

  const scrollCarrossel = (direcao: "esquerda" | "direita") => {
    if (carrosselRef.current) {
      const offset = direcao === "esquerda" ? -220 : 220;
      carrosselRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // 1. Métricas Globais (Acumulado Total)
  const metricasGlobais = useMemo(() => {
    let totalGasto = 0;
    let totalKm = 0;
    let totalEconomia = 0;

    REGISTROS_MOCK.forEach((r) => {
      totalGasto += r.custoCombustivel + r.custoPedagio;
      totalKm += r.distanciaKm;
      if (r.tipoRota === "sem_pedagio" || r.tipoPropulsao === "eletrico") {
        totalEconomia += 65.0;
      }
    });

    const custoPorKm = totalKm > 0 ? totalGasto / totalKm : 0;
    return { totalGasto, totalKm, custoPorKm, totalEconomia };
  }, []);

  // 2. Registros Filtrados do Período Selecionado
  const registrosDoPeriodo = useMemo(() => {
    return REGISTROS_MOCK.filter((r) => {
      const matchPeriodo = r.data.startsWith(periodoSelecionado);
      const matchVeiculo =
        filtroVeiculo === "todos" || r.veiculoApelido === filtroVeiculo;
      return matchPeriodo && matchVeiculo;
    });
  }, [periodoSelecionado, filtroVeiculo]);

  // 3. Métricas do Período Selecionado
  const metricasDoPeriodo = useMemo(() => {
    let combustivel = 0;
    let pedagio = 0;
    let km = 0;

    registrosDoPeriodo.forEach((r) => {
      combustivel += r.custoCombustivel;
      pedagio += r.custoPedagio;
      km += r.distanciaKm;
    });

    const total = combustivel + pedagio;
    return { total, combustivel, pedagio, km };
  }, [registrosDoPeriodo]);

  const periodoAtualObj = useMemo(() => {
    return (
      periodosDisponiveis.find((p) => p.chave === periodoSelecionado) ||
      periodosDisponiveis[0]
    );
  }, [periodosDisponiveis, periodoSelecionado]);

  // Instância do TanStack Table conectado com o tableConfig
  const table = useReactTable({
    data: registrosDoPeriodo,
    columns: gastosTableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleExportarCSV = () => {
    const cabecalho =
      "Data,Veiculo,Trajeto,Distancia_KM,Combustivel_R$,Pedagio_R$,Total_R$,Manutencao_Status\n";
    const linhas = registrosDoPeriodo
      .map(
        (r) =>
          `${r.data},"${r.veiculoApelido}","${r.origem} -> ${r.destino}",${r.distanciaKm.toFixed(1)},${r.custoCombustivel.toFixed(2)},${r.custoPedagio.toFixed(2)},${(r.custoCombustivel + r.custoPedagio).toFixed(2)},"${r.manutencaoNecessaria ? r.tipoManutencao || "Necessária" : "Em dia"}"`,
      )
      .join("\n");

    const blob = new Blob([cabecalho + linhas], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gastos_${periodoSelecionado}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-y-auto font-sans bg-[#090d16] text-slate-200">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 bg-[#0f172a] px-6 py-4 sticky top-0 z-20 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-md">
            <DollarSign size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 leading-tight">
              Painel de Gastos & Relatórios
            </h1>
            <p className="text-xs text-slate-500">
              Histórico de despesas por período cronológico e controle de
              revisões
            </p>
          </div>
        </div>

        {/* FILTRO VEÍCULO E EXPORTAÇÃO */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex items-center bg-[#131b2e] border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-xs transition-colors group">
            <Car
              size={14}
              className="text-slate-400 mr-2 flex-shrink-0 group-hover:text-slate-300"
            />
            <select
              value={filtroVeiculo}
              onChange={(e) => setFiltroVeiculo(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer appearance-none pr-6 w-full font-medium"
            >
              <option value="todos" className="bg-[#0f172a] text-slate-200">
                Todos os Veículos
              </option>
              <option
                value="Onix 1.0 Turbo"
                className="bg-[#0f172a] text-slate-200"
              >
                Onix 1.0 Turbo
              </option>
              <option
                value="Dolphin Mini"
                className="bg-[#0f172a] text-slate-200"
              >
                Dolphin Mini (EV)
              </option>
              <option
                value="Corolla Cross"
                className="bg-[#0f172a] text-slate-200"
              >
                Corolla Cross
              </option>
            </select>
            <ChevronDown
              size={13}
              className="text-slate-400 absolute right-2.5 pointer-events-none group-hover:text-slate-200"
            />
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-6 space-y-6 flex-1">
        {/* CARDS KPIS GLOBAIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Total Histórico
              </span>
              <DollarSign size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold font-mono text-white">
                R$ {metricasGlobais.totalGasto.toFixed(2)}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {metricasGlobais.totalKm.toFixed(0)} km acumulados em todas as
                rotas
              </p>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Custo Médio / KM
              </span>
              <BarChart3 size={16} className="text-blue-400" />
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold font-mono text-blue-400">
                R$ {metricasGlobais.custoPorKm.toFixed(2)}{" "}
                <span className="text-xs text-slate-400 font-normal">/km</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Combustível + pedágios
              </p>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Economia Total
              </span>
              <TrendingDown size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold font-mono text-emerald-400">
                R$ {metricasGlobais.totalEconomia.toFixed(2)}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rotas sem pedágio e opções elétricas
              </p>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Status das Revisões
              </span>
              <Wrench size={16} className="text-amber-400" />
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold font-mono text-amber-400">
                {
                  ALERTAS_MANUTENCAO_MOCK.filter((a) => a.status === "urgente")
                    .length
                }{" "}
                Alertas
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Veículos atingindo quilometragem limite
              </p>
            </div>
          </div>
        </div>

        {/* 📅 SELETOR DE PERÍODOS COM NAVEGAÇÃO HORIZONTAL */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar size={13} className="text-indigo-400" /> Períodos com
              Lançamentos (Mais recente primeiro):
            </span>
            <span className="text-xs font-mono text-indigo-400 font-semibold">
              Exibindo: {periodoAtualObj?.nomeCompleto}
            </span>
          </div>

          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => scrollCarrossel("esquerda")}
              className="p-1.5 bg-[#131b2e] hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 mr-2 flex-shrink-0 transition-colors cursor-pointer"
              title="Mover para mais recentes"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              ref={carrosselRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth flex-1 py-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {periodosDisponiveis.map((p) => {
                const isSelected = periodoSelecionado === p.chave;
                return (
                  <button
                    key={p.chave}
                    type="button"
                    onClick={() => setPeriodoSelecionado(p.chave)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 flex items-center gap-2 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400 scale-[1.02]"
                        : "bg-[#131b2e] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
                    }`}
                  >
                    <span>{p.labelPill}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollCarrossel("direita")}
              className="p-1.5 bg-[#131b2e] hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 ml-2 flex-shrink-0 transition-colors cursor-pointer"
              title="Mover para mais antigos"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* RESUMO DO PERÍODO ATUAL SELECIONADO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Total em {periodoAtualObj?.labelPill}
              </span>
              <span className="text-lg font-bold font-mono text-white">
                R$ {metricasDoPeriodo.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Fuel size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Combustível / Energia
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                R$ {metricasDoPeriodo.combustivel.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Coins size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Pedágios ({periodoAtualObj?.labelPill})
              </span>
              <span className="text-lg font-bold font-mono text-amber-400">
                R$ {metricasDoPeriodo.pedagio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 📋 TABELA USANDO O BASEDATATABLE */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#131b2e]/60">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Lançamentos de {periodoAtualObj?.nomeCompleto}
              </h3>
              <p className="text-[11px] text-slate-500">
                Histórico de custos de percursos e alertas operacionais
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono bg-[#090d16] px-2.5 py-1 rounded border border-slate-800">
              {registrosDoPeriodo.length}{" "}
              {registrosDoPeriodo.length === 1 ? "viagem" : "viagens"}
            </span>
          </div>

          <div className="w-full">
            <BaseDataTable
              table={table}
              isLoading={false}
              enablePagination={true}
              enableColumnResizing={true}
              alturaAutomatica={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
