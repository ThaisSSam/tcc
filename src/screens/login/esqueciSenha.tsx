// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Mail, Info, Key } from "lucide-react";
import { esqueciSenhaService } from "@/services/authService";

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Enviando...");

    try {
      const resposta = await esqueciSenhaService(email);
      setStatus(resposta.message);
    } catch (erro: any) {
      setStatus(`Falhou: ${erro.message}`);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090d16] p-4 font-sans">
      <div className="w-full max-w-md bg-[#0f172a]/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-sm shadow-2xl flex flex-col items-center">

        <div className="w-12 h-12 bg-[#46a2f2]/10 border border-[#46a2f2]/30 rounded-xl flex items-center justify-center mb-4">
          <Key className="text-white scale-x-[-1]"/>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Recuperar senha</h2>
        <p className="text-sm text-slate-400/80 text-center mb-6 px-4">
          Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>

        <form onSubmit={handleRecuperar} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              E-mail cadastrado <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="w-full p-2.5 pl-10 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-[#131c31] text-white text-sm transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white p-2.5 rounded-lg font-semibold text-sm transition-colors mt-2 shadow-lg shadow-blue-500/20"
          >
            Enviar link de recuperação
          </Button>

          <div className="text-center text-xs text-slate-400 mt-2">
            Lembrou a senha?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:underline font-medium ml-1 cursor-pointer"
            >
              Voltar ao login
            </button>
          </div>

          {status && <p className="text-center text-xs text-slate-300 mt-1">{status}</p>}
        </form>

        <div className="w-full mt-6 p-4 border border-slate-800/60 rounded-xl bg-[#192440]/40 flex items-start gap-3">
          <span className="text-slate-400 mt-0.5">
            <Info size={18} />
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            O link será enviado para o e-mail cadastrado e expirará em <span className="font-bold text-slate-200">30 minutos</span>.
          </p>
        </div>
      </div>
    </main>
  );
}