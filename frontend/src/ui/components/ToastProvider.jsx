import { createContext, useContext, useEffect, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
  });

  function showToast(message, type = 'info') {
    setToast({ message, type });
  }

  function closeToast() {
    setToast({ message: '', type: 'info' });
  }

  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => {
      closeToast();
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.message]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed right-50 top-15 z-50 flex flex-col gap-3">
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}