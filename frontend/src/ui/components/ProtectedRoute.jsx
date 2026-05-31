/* ProtectedRoute.jsx defines the ProtectedRoute component, which is responsible for protecting certain routes in the application
by checking for the presence of an authentication token in local storage. If the token is not found, 
it redirects the user to the login page; otherwise, it renders the child components passed to it. */
import { Navigate } from 'react-router-dom';

// The ProtectedRoute component checks for the presence of an authentication token in local storage 
// and conditionally renders its children or redirects to the login page.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
// Exporting the ProtectedRoute component as the default export of this module, allowing it to be imported and used in other parts of the application to protect specific routes.
export default ProtectedRoute;