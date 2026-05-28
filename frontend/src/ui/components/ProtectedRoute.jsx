import { Navigate } from 'react-router-dom';

// This component is a component that protects routes by checking for the presence of an authentication token in local storage. 
// If the token is not found, it redirects the user to the login page. If the token exists, it renders the child components passed to it.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;