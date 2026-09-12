import React, { useState } from 'react';
import {
  Car,
  Fuel,
  Zap,
  Leaf,
  Save,
  AlertCircle,
} from 'lucide-react';
import { type Veiculo } from '../consultarVeiculos/table/tableConfig';
import { veiculosEndpoints, type VeiculoDTO } from '../../../services/endpoints/veiculos';

interface VeiculoFormProps {
  initialData?: Partial<Veiculo>;
  isEditing?: boolean;
  idParaEdicao?: string;
  onSuccess?: () => void;
}

export function VeiculoForm({
  initialData,
  isEditing = false,
  idParaEdicao,
  onSuccess,
}: VeiculoFormProps) {
  const [apelido, setApelido] = useState(initialData?.apelido || '');
  const [marca, setMarca] = useState(initialData?.marca || '');
  const [modelo, setModelo] = useState(initialData?.modelo || '');
  const [anoFabricacao, setAnoFabricacao] = useState(
    initialData?.anoFabricacao?.toString() || new Date().getFullYear().toString()
  );
  const [tipoPropulsao, setTipoPropulsao] = useState<'combustao' | 'eletrico' | 'hibrido'>(
    initialData?.tipoPropulsao || 'combustao'
  );
  const [consumo, setConsumo] = useState(initialData?.consumo?.toString() || '');
  const [capacidadeBateria, setCapacidadeBateria] = useState(
    initialData?.capacidadeBateria?.toString() || ''
  );
  const [autonomiaKm, setAutonomiaKm] = useState(
    initialData?.autonomiaKm?.toString() || ''
  );

  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!apelido.trim()) novosErros.apelido = 'Informe um apelido ou identificação.';
    if (!marca.trim()) novosErros.marca = 'Informe a marca.';
    if (!modelo.trim()) novosErros.modelo = 'Informe o modelo.';
    
    const anoNum = parseInt(anoFabricacao, 10);
    if (!anoFabricacao || isNaN(anoNum) || anoNum < 1980 || anoNum > new Date().getFullYear() + 1) {
      novosErros.anoFabricacao = 'Informe um ano de fabricação válido.';
    }

    const consumoNum = parseFloat(consumo);
    if (!consumo || isNaN(consumoNum) || consumoNum <= 0) {
      novosErros.consumo = 'Informe um valor de consumo médio válido.';
    }

    if (tipoPropulsao === 'eletrico' || tipoPropulsao === 'hibrido') {
      const capNum = parseFloat(capacidadeBateria);
      if (capacidadeBateria && (isNaN(capNum) || capNum <= 0)) {
        novosErros.capacidadeBateria = 'A capacidade deve ser um número positivo.';
      }

      const autNum = parseFloat(autonomiaKm);
      if (tipoPropulsao === 'eletrico' && (!autonomiaKm || isNaN(autNum) || autNum <= 0)) {
        novosErros.autonomiaKm = 'Informe a autonomia estimada para o veículo 100% elétrico.';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroGeral(null);
    if (!validarFormulario()) return;

    // Normalização das colunas conforme o modelo de persistência do MySQL
    const payloadApi: Partial<VeiculoDTO> = {
      apelido: apelido.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano_fabricacao: parseInt(anoFabricacao, 10),
      tipo_propulsao: tipoPropulsao,
      consumo_kml: tipoPropulsao === 'combustao' ? parseFloat(consumo) : null,
      consumo_kwh_100km: tipoPropulsao === 'eletrico' ? parseFloat(consumo) : null,
      capacidade_bateria_kwh: capacidadeBateria ? parseFloat(capacidadeBateria) : null,
      autonomia_km: autonomiaKm ? parseFloat(autonomiaKm) : null,
      fonte_consumo: 'manual',
    };

    try {
      setSalvando(true);
      if (isEditing && idParaEdicao) {
        await veiculosEndpoints.atualizar(idParaEdicao, payloadApi);
      } else {
        await veiculosEndpoints.cadastrar(payloadApi);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErroGeral(err.message || 'Erro ao persistir veículo no banco.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w">
      {erroGeral && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{erroGeral}</span>
        </div>
      )}

      {/* TIPO DE PROPULSÃO */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
          Tipo de Motorização / Propulsão:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* COMBUSTÃO */}
          <button
            type="button"
            onClick={() => setTipoPropulsao('combustao')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              tipoPropulsao === 'combustao'
                ? 'bg-amber-500/10 border-amber-500/80 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-[#131b2e] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${tipoPropulsao === 'combustao' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
              <Fuel size={18} />
            </div>
            <div>
              <span className="block font-semibold text-xs text-slate-200">Combustão</span>
              <span className="text-[10px] text-slate-400">Gasolina, Etanol ou Diesel</span>
            </div>
          </button>

          {/* HÍBRIDO */}
          <button
            type="button"
            onClick={() => setTipoPropulsao('hibrido')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              tipoPropulsao === 'hibrido'
                ? 'bg-blue-500/10 border-blue-500/80 text-blue-300 shadow-md shadow-blue-500/10'
                : 'bg-[#131b2e] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${tipoPropulsao === 'hibrido' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
              <Leaf size={18} />
            </div>
            <div>
              <span className="block font-semibold text-xs text-slate-200">Híbrido (HEV/PHEV)</span>
              <span className="text-[10px] text-slate-400">Motor a combustão + elétrico</span>
            </div>
          </button>

          {/* 100% ELÉTRICO */}
          <button
            type="button"
            onClick={() => setTipoPropulsao('eletrico')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              tipoPropulsao === 'eletrico'
                ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-[#131b2e] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${tipoPropulsao === 'eletrico' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              <Zap size={18} />
            </div>
            <div>
              <span className="block font-semibold text-xs text-slate-200">100% Elétrico (BEV)</span>
              <span className="text-[10px] text-slate-400">Bateria recarregável</span>
            </div>
          </button>
        </div>
      </div>

      {/* DADOS GERAIS DO VEÍCULO */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Car size={15} className="text-blue-500" /> Identificação do Veículo
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Apelido do Veículo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder="Ex.: Carro da Empresa, Meu Onix, SUV de Viagem"
              className={`w-full px-3 py-2 bg-[#131b2e] border rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${
                erros.apelido ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {erros.apelido && <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{erros.apelido}</p>}
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Ano de Fabricação <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={anoFabricacao}
              onChange={(e) => setAnoFabricacao(e.target.value)}
              placeholder="Ex.: 2024"
              className={`w-full px-3 py-2 bg-[#131b2e] border rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${
                erros.anoFabricacao ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {erros.anoFabricacao && <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{erros.anoFabricacao}</p>}
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Marca <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ex.: Chevrolet, Toyota, BYD, Volvo"
              className={`w-full px-3 py-2 bg-[#131b2e] border rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${
                erros.marca ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {erros.marca && <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{erros.marca}</p>}
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Modelo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ex.: Onix 1.0 Turbo, Corolla Cross, Dolphin Mini"
              className={`w-full px-3 py-2 bg-[#131b2e] border rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${
                erros.modelo ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {erros.modelo && <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{erros.modelo}</p>}
          </div>
        </div>
      </div>

      {/* EFICIÊNCIA & CONSUMO */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          {tipoPropulsao === 'eletrico' ? <Zap size={15} className="text-emerald-400" /> : <Fuel size={15} className="text-amber-400" />}
          Consumo & Eficiência Energética
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {tipoPropulsao === 'eletrico' ? 'Consumo Médio (kWh / 100km)' : 'Consumo Médio (km / litro)'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={consumo}
                onChange={(e) => setConsumo(e.target.value)}
                placeholder={tipoPropulsao === 'eletrico' ? 'Ex.: 14.5' : 'Ex.: 13.8'}
                className={`w-full pl-3 pr-16 py-2 bg-[#131b2e] border rounded-lg font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors ${
                  erros.consumo ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              <span className="absolute right-3 top-2 text-slate-500 font-mono text-[11px] pointer-events-none">
                {tipoPropulsao === 'eletrico' ? 'kWh/100km' : 'km/l'}
              </span>
            </div>
            {erros.consumo && <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{erros.consumo}</p>}
          </div>

          {(tipoPropulsao === 'eletrico' || tipoPropulsao === 'hibrido') && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {tipoPropulsao === 'hibrido' ? 'Autonomia Modo Elétrico (Opcional)' : 'Autonomia Estimada Total'} {tipoPropulsao === 'eletrico' && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={autonomiaKm}
                  onChange={(e) => setAutonomiaKm(e.target.value)}
                  placeholder={tipoPropulsao === 'hibrido' ? 'Ex.: 55' : 'Ex.: 320'}
                  className={`w-full pl-3 pr-12 py-2 bg-[#131b2e] border rounded-lg font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors ${
                    erros.autonomiaKm ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono text-[11px] pointer-events-none">
                  km
                </span>
              </div>
              {erros.autonomiaKm && <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{erros.autonomiaKm}</p>}
            </div>
          )}

          {(tipoPropulsao === 'eletrico' || tipoPropulsao === 'hibrido') && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Capacidade da Bateria (kWh) {tipoPropulsao === 'hibrido' ? '(Opcional)' : ''}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={capacidadeBateria}
                  onChange={(e) => setCapacidadeBateria(e.target.value)}
                  placeholder={tipoPropulsao === 'hibrido' ? 'Ex.: 15.0' : 'Ex.: 45.0'}
                  className={`w-full pl-3 pr-12 py-2 bg-[#131b2e] border rounded-lg font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors ${
                    erros.capacidadeBateria ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono text-[11px] pointer-events-none">
                  kWh
                </span>
              </div>
              {erros.capacidadeBateria && <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{erros.capacidadeBateria}</p>}
            </div>
          )}
        </div>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save size={14} /> {salvando ? 'Gravando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}
        </button>
      </div>
    </form>
  );
}