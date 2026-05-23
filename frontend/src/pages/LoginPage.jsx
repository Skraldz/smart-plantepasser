import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/g1.background.jpg';
import electronicslogo from '../assets/g1.electronics.hvid.png';
import { login } from '../api/auth';

/* This component renders the login page, allowing users to enter their email and password to authenticate. 
It uses the login function from the auth API to send the credentials to the backend, and handles success and error cases. */
function LoginPage() {
  const navigate = useNavigate();

  // State variables for form inputs, error messages, and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


/* Handles form submission by calling the login API function and managing the authentication flow 
including storing the JWT token and navigating to the dashboard on success, or displaying an error message on failure. */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  // The JSX structure of the login page, including a background image, a logo, and a form for user input.
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
            Welcome back
          </h1>
          <p className="text-sm text-slate-200">
            Sign in to access your plant dashboard.
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
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;