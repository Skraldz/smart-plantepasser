// main.jsx is the entry point of the React application, which renders the App component inside a BrowserRouter for routing, 
// and wraps it with various context providers for managing state related to clusters, plants, and toast notifications. 
// It also imports global styles from index.css.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ToastProvider } from './ui/components/ToastProvider';
import { PlantProvider } from './ui/components/PlantProvider';
import { ClusterProvider } from './ui/components/ClusterProvider';

// The main entry point of the React application, which renders the App component inside a BrowserRouter for routing,
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