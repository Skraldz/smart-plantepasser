// This file defines the NotFoundPage component
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      <h1 className="mb-4 text-5xl font-bold text-white">404</h1>
      <p className="mb-6 text-slate-400">The page you are looking for does not exist.</p>
      <Link
        to="/login"
        className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500"
      >
        Back to Login
      </Link>
    </div>
  );
}

export default NotFoundPage;