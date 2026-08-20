import React from 'react';
import { useState, useEffect, useEffectEvent, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useToast } from "./contexts/CustomToastContext";
import AppLoadingFallback from "./components/layout/AppLoadingFallback";
import sairDoSistema from "./services/authService";

import loginEndpoints from "./services/endpoints/login";

const LoginScreen = lazy(() => import("./screens/login/index"));
const ForgotPasswordScreen = lazy(() => import("./screens/login/esqueciSenha"));
const DashboardScreen = lazy(() => import("./screens/dashboard"));

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("auth_token") || localStorage.getItem("token");
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoginSucesso = (novoToken: string) => {
    localStorage.setItem("auth_token", novoToken);
    setToken(novoToken);
  };

  const handleLogout = async () => {
    try {
      // 2. CORREÇÃO: Chamamos a propriedade correta de dentro do objeto exportado
      await loginEndpoints.executarLogout();
    } catch (error: any) {
      // Regra do PDI aplicada com segurança
      const mensagemErro =
        error.response?.data?.errors?.[0] ||
        "Erro ao encerrar sessão no servidor.";

      toast({
        variant: "destructive",
        title: "Erro no Logout",
        description: mensagemErro,
      });
    } finally {
      // Limpeza local dos estados do sistema
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");

      setToken(null);
      navigate("/login", { replace: true });
    }
  };

  if (!token) {
    return (
      <Suspense fallback={<AppLoadingFallback />}>
        <Routes>
          <Route
            path="/login"
            element={<LoginScreen onLoginSucesso={handleLoginSucesso} />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={<DashboardScreen onLogout={handleLogout} />}
        />
        <Route path="/login" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
}
