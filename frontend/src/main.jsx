import React from 'react'; // Import React for building the user interface of the application
import ReactDOM from 'react-dom/client'; // Import React and ReactDOM for rendering the application to the DOM
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter for handling routing in the application
import App from './App'; // Import the main App component which serves as the root of the application
import './index.css'; // Import the main CSS file for styling the application, which includes Tailwind CSS styles

/* 
Code telling React to render app into page
ReactDOM: Render the application to the DOM
React.StrictMode: Enable strict mode for highlighting potential problems in the application
BrowserRouter: Wrap the App component with BrowserRouter to enable routing
App: Render the main App component
*/ 
ReactDOM.createRoot(document.getElementById('root')).render( 
  <React.StrictMode>
    <BrowserRouter>
      <App /> 
    </BrowserRouter>
  </React.StrictMode>
);