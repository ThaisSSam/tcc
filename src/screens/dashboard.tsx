import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, Car, Route, UserIcon } from "lucide-react";

export default function DashboardScreen() {
  const navigate = useNavigate();

  const dadosMeses = useMemo(() => {
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    const resultado = [];
    const alturasMock = [35, 55, 20, 70, 45, 65, 30, 80, 50, 88, 40, 60];

    for (let i = 11; i >= 0; i--) {
      const dataRef = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      resultado.push({
        nome: nomesMeses[dataRef.getMonth()],
        altura: alturasMock[11 - i],
        isAtual: i === 0,
      });
    }
    return resultado;
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-y-auto">
      <header className="flex justify-between items-center border-b border-slate-800 bg-[#0f172a] px-6 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-100 font-['Inter']">
          Calculadora de trajeto
        </h1>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Última atualização: agora mesmo</span>
          <button className="p-2 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all relative">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>
          <button className="p-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all">
            <Settings size={16} />
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/10">
            <UserIcon size={16} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 bg-[#090d16]">
        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => navigate("/veiculos")}
            className="border border-slate-800 rounded-xl p-5 bg-[#131b2e] flex flex-col justify-between h-32 relative hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Veículos</span>
              <Car size={16} className="text-blue-600/60" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-100">4</h2>
              <p className="text-[11px] text-slate-500 mt-1">Veículos cadastrados na garagem</p>
            </div>
          </div>

          <div 
            onClick={() => navigate("/rotas")}
            className="border border-slate-800 rounded-xl p-5 bg-[#131b2e] flex flex-col justify-between h-32 relative hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Rotas</span>
              <Route size={16} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-emerald-400">12</h2>
              <p className="text-[11px] text-slate-500 mt-1">Simulações realizadas</p>
            </div>
          </div>
        </div>

        {/* MAPA */}
        <div className="border border-slate-800 rounded-xl p-5 bg-[#131b2e]">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Mapa</h3>
          <img src="/imagens/mapa.png" alt="Mapa de rotas" className="w-full h-auto rounded-lg object-cover max-h-64" />
        </div>

        {/* GRÁFICO */}
        <div className="border border-slate-800 rounded-xl p-5 bg-[#131b2e]">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
            Gastos por rota (em R$) - Últimos 12 meses
          </h3>
          <div className="flex items-end justify-between h-28 px-4 w-full gap-2">
            {dadosMeses.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full rounded-t transition-all ${
                    item.isAtual ? "bg-gradient-to-t from-indigo-600 to-purple-400 shadow-md shadow-indigo-500/20" : "bg-slate-800/40 hover:bg-slate-700/60"
                  }`}
                  style={{ height: `${item.altura}%` }}
                ></div>
                <span className={`text-[9px] font-medium ${item.isAtual ? "text-indigo-400 font-bold" : "text-slate-500"}`}>
                  {item.nome}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}