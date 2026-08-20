import React from 'react';

const AppLoadingFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      
      <p className="text-lg font-medium animate-pulse">
        Carregando...
      </p>
    </div>
  );
};

export default AppLoadingFallback;