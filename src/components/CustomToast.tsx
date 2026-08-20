import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface CustomToastProps {
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

const CustomToast: React.FC<CustomToastProps> = React.memo(
  ({ title, message, onClose, type = 'success', duration = 10000, persistent = false }) => {
    const onCloseRef = useRef(onClose);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toastDuration = duration ?? 10000;

    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (!persistent) {
        timerRef.current = setTimeout(() => {
          onCloseRef.current();
        }, toastDuration);
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [toastDuration, persistent]);

    const getTypeStyles = () => {
      switch (type) {
        case 'success':
          return {
            container: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
            iconBg: 'bg-emerald-500/20',
            IconComponent: CheckCircle2,
          };
        case 'error':
          return {
            container: 'bg-rose-950/40 border-rose-500/30 text-white',
            iconBg: 'bg-rose-500/20',
            IconComponent: AlertCircle,
          };
        case 'warning':
          return {
            container: 'bg-amber-950/40 border-amber-500/30 text-amber-400',
            iconBg: 'bg-amber-500/20',
            IconComponent: AlertTriangle,
          };
        case 'info':
          return {
            container: 'bg-blue-950/40 border-blue-500/30 text-blue-400',
            iconBg: 'bg-blue-500/20',
            IconComponent: Info,
          };
        default:
          return {
            container: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
            iconBg: 'bg-emerald-500/20',
            IconComponent: CheckCircle2,
          };
      }
    };

    const styles = getTypeStyles();

    const processMessage = () => {
      if (!message) return { mainMessage: '', errors: [] };
      const messageStr = typeof message === 'string' ? message : String(message);
      const parts = messageStr.split(/\n\s*\n/);

      if (parts.length > 1) {
        const mainMessage = parts[0].trim();
        const errorsText = parts.slice(1).join('\n');
        const errors = errorsText.split('\n').filter((line) => line.trim() !== '');
        return { mainMessage, errors };
      }

      const lines = messageStr.split('\n').filter((line) => line.trim() !== '');
      if (lines.length > 1) {
        return { mainMessage: lines[0], errors: lines.slice(1) };
      }

      return { mainMessage: messageStr, errors: [] };
    };

    const { mainMessage, errors } = processMessage();
    const Icon = styles.IconComponent;

    return (
      <div
        className={`w-[450px] p-4 border ${styles.container} rounded-xl flex justify-start items-start gap-4 backdrop-blur-md`}
        style={{ boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)' }}
      >
        <div className="flex-1 flex justify-start items-start gap-3">
          <div className={`p-1.5 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className="currentColor" />
          </div>
          <div className="flex-1 flex flex-col justify-start items-start gap-1">
            <div className="text-md font-semibold text-white">
              {title}
            </div>
            <div className="w-full flex flex-col gap-1">
              {mainMessage && (
                <div className="text-xs text-slate-300 font-normal text-white">
                  {mainMessage}
                </div>
              )}
              {errors.length > 0 && (
                <ul className="w-full list-disc list-inside text-xs text-slate-400 font-normal space-y-1 ml-1 mt-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          aria-label="Fechar"
          className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
    );
  },
);

CustomToast.displayName = 'CustomToast';

export default CustomToast;