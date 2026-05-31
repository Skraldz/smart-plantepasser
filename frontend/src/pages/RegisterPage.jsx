// RegisterPage.jsx defines the RegisterPage component, which renders the registration interface for new users to create an account.
import { useState } from 'react'; // React hook for managing component state
import { Link, useNavigate } from 'react-router-dom'; // Link for navigation between routes, useNavigate for programmatic navigation
import { register } from '../api/auth'; // Importing the register function from the auth API to handle user registration

import backgroundImage from '../assets/g1.background.jpg';
import electronicslogo from '../assets/g1.electronics.hvid.png';

/*This component renders the registration page,
It uses the register function from the auth API to send the registration data to the backend, and handles success and error cases.*/
function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [productKey, setProductKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handles form submission by calling the register API function and managing the registration flow
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
  await register(
    email,
    password,
    productKey
  );

  navigate('/');
} catch (err) {
  console.error(err);

  setError(
    err.response?.data?.detail ||
    'Registration failed.'
  );
} finally {
      setLoading(false);
    }
  }

  // The JSX structure of the registration page, including a background image, a logo, and a form for user input.
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

      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
            Create account
          </h1>
          <p className="text-sm text-slate-200">
            Register to connect and manage your plant system.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Product key
            </label>
            <input
              type="text"
              placeholder="Enter your product key"
              value={productKey}
              onChange={(e) => setProductKey(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link
            to="/"
            className="font-medium text-emerald-400 transition hover:text-emerald-300"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

// Exporting the RegisterPage component as the default export of this module, allowing it to be imported and used in other parts of the application.
export default RegisterPage;