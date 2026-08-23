import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SidebarComponent from '../Sidebar';

interface AppLayoutProps {
  onLogout: () => Promise<void> | void;
}

export default function AppLayout({ onLogout }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="text-white bg-[#0f172a] h-screen w-screen flex flex-row font-sans selection:bg-blue-500/30 overflow-hidden">
      <SidebarComponent
        currentPath={location.pathname}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onNavigate={(path) => navigate(path)}
        onLogout={onLogout}
      />

      <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}