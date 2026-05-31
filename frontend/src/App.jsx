// App.jsx defines the main App component, which sets up the routing for the application using React Router. 
// It includes routes for login, registration, dashboard, settings, plants management, and a catch-all route for 404 Not Found pages. 
// The App component also wraps protected routes with the ProtectedRoute component to ensure that only authenticated users can access certain pages.
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import PlantsPage from './pages/PlantsPage';
import RegisterPlantPage from './pages/RegisterPlantPage';
import ProtectedRoute from './ui/components/ProtectedRoute';
import AppLayout from './ui/components/AppLayout';

// The App component defines the main routing structure of the application, 
// including protected routes that require authentication and a catch-all route for handling 404 Not Found errors.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/plants" element={<PlantsPage />} />
        <Route path="/plants/register" element={<RegisterPlantPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// Export the App component as the default export of this module, allowing it to be imported and used in other parts of the application.
export default App;