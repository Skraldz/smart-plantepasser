import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import electronicslogo from '../../assets/g1.electronics.hvid.png';

function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-500 text-slate-950'
        : 'border border-white/10 bg-slate-900 text-white hover:bg-slate-800'
    }`;

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
              className="w-40 md:w-48"
            />
            
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;