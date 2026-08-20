import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomToast from '../components/CustomToast';

interface ToastOptions {
  title: string;
  description: string;
  variant?: 'success' | 'destructive' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);

  const toast = useCallback(({ title, description, variant = 'success', duration = 6000 }: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-full">
        {toasts.map((t) => (
          <CustomToast
            key={t.id}
            title={t.title}
            message={t.description}
            type={t.variant === 'destructive' ? 'error' : t.variant}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de um ToastProvider');
  return context;
};