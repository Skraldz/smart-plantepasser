import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ToastProvider } from './ui/components/ToastProvider';
import { PlantProvider } from './ui/components/PlantProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <PlantProvider>
          <App />
        </PlantProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);