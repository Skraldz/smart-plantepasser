// This component defines the main layout of the application, including the header with navigation links and logout button, 
// as well as a main content area where different pages will be rendered based on the current route. 
// It uses React Router's NavLink for navigation and Outlet for rendering child routes.
import { NavLink, Outlet, useNavigate } from 'react-router-dom'; // React Router components for navigation and rendering child routes
import electronicslogo from '../../assets/g1.electronics.hvid.png';

// The AppLayout component serves as the main layout for the application, providing a consistent header and navigation across different pages.
function AppLayout() {
  const navigate = useNavigate();

  // Function to handle user logout by removing the authentication token from local storage and navigating to the login page.
  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  // Function to determine the CSS classes for navigation links based on whether they are active or not, providing visual feedback to the user about the current page.
  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-500 text-slate-950'
        : 'border border-white/10 bg-slate-900 text-white hover:bg-slate-800'
    }`;

  // The JSX structure of the AppLayout component, including the header with navigation links and the main content area where child routes will be rendered.
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">

          <div>
              <p className="text-lg uppercase tracking-[0.2em] text-emerald-400">
                Greenhouse One
              </p>
              <p className="text-sm text-slate-400">
                Growing smarter, greener, together.
              </p>
         </div> 
           
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>

            <NavLink to="/plants" className={navLinkClass}>
              Plants
            </NavLink>

            <NavLink to="/plants/register" className={navLinkClass}>
              Register Plant
            </NavLink>

            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>

            <button
              onClick={handleLogout}
              className="ml-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Log out
            </button>
          </div>

            <img
              src={electronicslogo}
              alt="Electronics Logo"
              className="w-30 md:w-38"
            />
            
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

// Exporting the AppLayout component as the default export of this module, allowing it to be imported and used in other parts of the application.
export default AppLayout;