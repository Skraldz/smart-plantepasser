// ToastProvider.jsx defines the ToastProvider component, which provides a context for managing toast notifications in the application. 
// It allows child components to show toast messages by using the showToast function provided through the context. 
// The ToastProvider also handles the display and automatic dismissal of toast messages after a certain duration.

// React functions for creating context, accessing context, managing component state, and performing side effects
import { createContext, useContext, useEffect, useState } from 'react'; 

import Toast from './Toast';

// Creating a new context for managing toast notifications in the application,
// allowing components to access the showToast function and trigger toast messages.
const ToastContext = createContext();

// The ToastProvider component manages the state of the current toast message
// and provides the showToast function to child components through the ToastContext.Provider.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
  });

  // Function to show a toast message, takes a message and an optional type (defaulting to 'info') 
  // as arguments and updates the toast state with the new message and type.
  function showToast(message, type = 'info') {
    setToast({ message, type });
  }

  // Function to close the toast message, resets the toast state to its initial values.
  function closeToast() {
    setToast({ message: '', type: 'info' });
  }
// Use the useEffect hook to automatically close the toast message after 3 seconds whenever a new toast message is shown.
  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => { // Set a timer to automatically close the toast message after 3 seconds
      closeToast();
    }, 3000);

    return () => clearTimeout(timer); // Clear the timer if the component unmounts or if a new toast message is shown before the previous one is dismissed
  }, [toast.message]);

  // The ToastProvider component provides the showToast function and the current toast state to child components through the ToastContext.Provider,
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

// Custom hook for accessing the toast context values, allowing components to easily consume the showToast function provided by the ToastProvider.
export function useToast() {
  return useContext(ToastContext);
}