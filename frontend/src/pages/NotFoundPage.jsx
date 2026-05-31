// NotFoundPage.jsx defines the NotFoundPage component, renders a 404 Not Found page when a user navigates to a route that does not exist.
import { Link } from 'react-router-dom'; // Link component from react-router-dom for navigation between routes
import backgroundImage from '../assets/g1.background.jpg';
import electronicslogo from '../assets/g1.electronics.hvid.png';

// This component renders a 404 Not Found page, which is displayed when a user navigates to a route that does not exist.
function NotFoundPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-6"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <img
        src={electronicslogo}
        alt="Electronics Logo"
        className="absolute right-20 top-20 w-64"
      />

      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/70 p-8 text-center shadow-2xl backdrop-blur-md">
        <h1 className="mb-3 text-5xl font-bold tracking-tight text-white">404</h1>
        <p className="mb-6 text-sm text-slate-200">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/login"
          className="inline-block rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

// Exporting the NotFoundPage component as the default export of this module, allowing it to be imported and used in other parts of the application.
export default NotFoundPage; //