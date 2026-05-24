function SettingsPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Manage account, hub, product key, and app preferences.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for email, password update, and profile settings.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Connected Hub</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for hub status, serial number, and firmware details.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Product Key</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for product key visibility and re-verification tools.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Preferences</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for notifications, themes, and plant care reminders.
          </p>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;