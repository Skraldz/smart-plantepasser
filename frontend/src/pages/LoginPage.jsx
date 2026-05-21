// This file defines the LoginPage component
function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Login</h1>
        <p className="text-sm text-slate-400">
          Sign in to access your plant dashboard.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;