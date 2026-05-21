// This file defines the DashboardPage component
function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-bold">Plant Dashboard</h1>
        <p className="mb-8 text-slate-400">
          Monitor soil moisture, plant health, and device activity.
        </p>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-2 text-xl font-semibold">Plant Status</h2>
            <p className="text-slate-400">Plant overview cards will go here.</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-2 text-xl font-semibold">Measurements</h2>
            <p className="text-slate-400">Charts and sensor history will go here.</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-2 text-xl font-semibold">Controls</h2>
            <p className="text-slate-400">Watering and lamp actions will go here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;