import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { VeiculoForm } from './veiculoForm';
import { type Veiculo } from '../consultarVeiculos/table/tableConfig';

export default function CadastrarVeiculoScreen() {
  const navigate = useNavigate();
  const [sucesso, setSucesso] = useState(false);

  const handleSalvar = (dadosVeiculo: Omit<Veiculo, 'id'>) => {
    // 1. Cria o objeto persistível
    const novoVeiculo: Veiculo = {
      ...dadosVeiculo,
      id: Date.now().toString(),
    };

    // 2. Persistência local (armazenada para uso imediato em mapa e simulações)
    try {
      const veiculosSalvos = JSON.parse(localStorage.getItem('veiculos_cadastrados') || '[]');
      veiculosSalvos.unshift(novoVeiculo);
      localStorage.setItem('veiculos_cadastrados', JSON.stringify(veiculosSalvos));
    } catch (err) {
      console.warn('Erro ao gravar no localStorage:', err);
    }

    // 3. Feedback visual e redirecionamento
    setSucesso(true);
    setTimeout(() => {
      navigate('/veiculos');
    }, 1200);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-y-auto font-sans bg-[#090d16] text-slate-200">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-slate-800 bg-[#0f172a] px-6 py-4 sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">        
          <div>
            <h1 className="font-bold text-lg text-slate-100 leading-tight">Cadastrar Novo Veículo</h1>
            <p className="text-xs text-slate-500">Adicione parâmetros de consumo para cálculo e simulação de rotas</p>
          </div>
        </div>
      </header>

      {/* FEEDBACK DE SUCESSO */}
      {sucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>Veículo cadastrado com sucesso! Redirecionando para a garagem...</span>
        </div>
      )}

      {/* FORMULÁRIO */}
      <main className="p-6 flex-1">
        <VeiculoForm onSubmit={handleSalvar} />
      </main>
    </div>
  );
}