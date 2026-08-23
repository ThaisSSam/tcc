import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLoadingFallback from "./components/layout/AppLoadingFallback";
import AppLayout from "./components/layout/AppLayout";
import ConsultarRotasScreen from "./screens/rotas/consultarRotas";
import MapaRotasScreen from "./screens/mapa";

const LoginScreen = lazy(() => import("./screens/login/index"));
const ForgotPasswordScreen = lazy(() => import("./screens/login/esqueciSenha"));
const DashboardScreen = lazy(() => import("./screens/dashboard"));
const ConsultarVeiculosScreen = lazy(() => import("./screens/veiculos/consultarVeiculos/index"));

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("auth_token") || localStorage.getItem("token");
  });

  const handleLoginSucesso = (novoToken: string) => {
    localStorage.setItem("auth_token", novoToken);
    setToken(novoToken);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
  };

  if (!token) {
    return (
      <Suspense fallback={<AppLoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginScreen onLoginSucesso={handleLoginSucesso} />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppLoadingFallback />}>
      <Routes>
        <Route element={<AppLayout onLogout={handleLogout} />}>
          <Route path="/home" element={<DashboardScreen />} />
          <Route path="/veiculos" element={<ConsultarVeiculosScreen />} />
          <Route path="/rotas" element={<ConsultarRotasScreen />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/mapa" element={<MapaRotasScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
}