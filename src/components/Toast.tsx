import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-emerald-500" />,
  error: <AlertCircle size={16} className="text-rose-500" />,
  info: <Info size={16} className="text-blue-500" />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider duration={3000}>
        {children}

        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-60 max-w-xs animate-in slide-in-from-right-full"
          >
            {icons[toast.type]}
            <ToastPrimitive.Description className="text-sm text-slate-700 dark:text-slate-200 flex-1">
              {toast.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close asChild>
              <button
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="fixed top-4 right-4 flex flex-col gap-2 z-[100] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};
