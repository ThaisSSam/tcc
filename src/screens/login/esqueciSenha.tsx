import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import loginEndpoints from '../../services/endpoints/login';

export default function EsqueciSenhaScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMensagem('');

    try {
      const res = await loginEndpoints.solicitarRecuperacao(email);
      setStatus('success');
      setMensagem(res.message || 'Instruções enviadas para o seu e-mail.');
    } catch (err: any) {
      setStatus('error');
      setMensagem(err.message || 'Erro ao solicitar recuperação.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-[#131b2e] border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Voltar para o Login
        </button>

        <div className="space-y-2">
          <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/30">
            <KeyRound size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Recuperar Senha</h1>
          <p className="text-xs text-slate-400">
            Informe o e-mail cadastrado para receber as instruções de redefinição de acesso.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs space-y-3">
            <p>{mensagem}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                E-mail Cadastrado <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-800/40 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {status === 'error' && (
              <p className="text-xs text-rose-500">{mensagem}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Instruções'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}