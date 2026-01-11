'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { usePortal } from '@/hooks/usePortal';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const portalContainer = usePortal();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = useCallback((message: string, type?: ToastType) => {
    addToast(message, type);
  }, [addToast]);

  const success = useCallback((message: string) => {
    addToast(message, 'success');
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast(message, 'error');
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast(message, 'info');
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {portalContainer &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[100001] flex flex-col gap-2">
            <AnimatePresence>
              {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
              ))}
            </AnimatePresence>
          </div>,
          portalContainer
        )}
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm min-w-[280px] max-w-[400px]',
        styles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
