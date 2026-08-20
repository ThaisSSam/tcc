import React from "react";
import SidebarComponent from "../components/Sidebar";
import {
  Trash2,
  AlertTriangle,
  CheckSquare,
  Play,
  Bell,
  Settings,
  Car,
  Route,
  User,
  User2,
  UserIcon,
} from "lucide-react";

interface DashboardScreenProps {
  onLogout: () => Promise<void> | void;
}

export default function DashboardScreen({ onLogout }: DashboardScreenProps) {
  return (
    <div className="text-white bg-[#0f172a] min-h-screen flex flex-row font-sans selection:bg-blue-500/30">
      <SidebarComponent onLogout={onLogout} />

      <div className="flex flex-col w-full overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center border-b border-slate-800 bg-[#0f172a] px-8 py-5 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-100 font-['Inter']">
              Calculadora de trajeto
            </h1>
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-800 rounded-xl p-5 bg-[#131b2e] flex flex-col justify-between h-32 relative group hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Veículos
                </span>
                <Car size={16} className="text-blue-600/60" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-100"></h2>
                <p className="text-[11px] text-slate-500 mt-1"></p>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl p-5 bg-[#131b2e] flex flex-col justify-between h-32 relative hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Rotas
                </span>
                <Route size={16} className="text-slate-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-rose-500"></h2>
                <p className="text-[11px] text-slate-500 mt-1"></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="lg:col-span-3 border border-slate-800 rounded-xl p-5 bg-[#131b2e] flex flex-col justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
                Mapa
              </h3>
              <img
                src ="../public/imagens/mapa.png"
                className = ""
                />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="w-full border border-slate-800 rounded-xl p-5 bg-[#131b2e]">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
                Gastos por rota (em R$) - Últimos 12 meses
              </h3>

              <div className="flex items-end justify-between h-28 px-4 w-full gap-2">
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "35%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "55%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "20%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium">
                    T5
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "70%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "45%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "65%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "30%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "80%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "50%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "88%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "95%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div>
                {/* <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-slate-800/40 rounded-t hover:bg-slate-700/60 transition-all"
                    style={{ height: "40%" }}
                  ></div>
                  <span className="text-[9px] text-slate-600 font-medium"></span>
                </div> */}
                {/* A última barra em destaque com gradiente igual à imagem */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t shadow-md shadow-indigo-500/10"
                    style={{ height: "60%" }}
                  ></div>
                  <span className="text-[9px] text-indigo-400 font-semibold"></span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
