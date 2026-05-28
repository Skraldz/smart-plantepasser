import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ToastProvider } from './ui/components/ToastProvider';
import { PlantProvider } from './ui/components/PlantProvider';
import { ClusterProvider } from './ui/components/ClusterProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClusterProvider>
        <ToastProvider>
          <PlantProvider>
            <App />
          </PlantProvider>
        </ToastProvider>
      </ClusterProvider>
    </BrowserRouter>
  </React.StrictMode>
);