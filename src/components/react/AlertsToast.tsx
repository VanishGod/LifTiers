// components/Toast.tsx
import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  duration?: number;  // en milisegundos (default: 3000)
  color?: 'success' | 'error' | 'warning' | 'info' | 'default';
  onClose?: () => void;
}

const colorMap = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
  default: 'bg-gray-800 text-white',
};

const iconMap = {
  success: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  default: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const AlertsToast = ({ 
  message, 
  duration = 3000, 
  color = 'default',
  onClose 
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Mostrar con animación
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Ocultar después de la duración
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIsRemoving(true);
        if (onClose) onClose();
      }, 500);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  if (isRemoving) return null;

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className={`${colorMap[color]} px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md mx-4 min-w-200px`}>
        {iconMap[color]}
        <span className="text-sm font-medium">{message}</span>
        <button 
          className="ml-2 text-white/70 hover:text-white transition-colors shrink-0"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              setIsRemoving(true);
              if (onClose) onClose();
            }, 500);
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AlertsToast;