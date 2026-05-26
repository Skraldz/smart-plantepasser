function QuickActions({
  lampStatus,
  onWateringCycle,
  onToggleLamp,
  onRefreshSensors,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>

      <p className="mt-1 text-sm text-slate-400">
        Manual controls and shortcuts.
      </p>

      <div className="mt-6 space-y-4">
        <button
          onClick={onWateringCycle}
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Start watering cycle
        </button>

        <button
          onClick={onToggleLamp}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Toggle growth lamp
        </button>

        <p className="text-sm text-slate-400">
          Lamp is currently {lampStatus}.
        </p>

        <button
          onClick={onRefreshSensors}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Refresh sensor data
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <h3 className="text-lg font-semibold text-white">System Notice</h3>

        <p className="mt-2 text-sm text-slate-400">
          All systems are operational. No critical alerts detected.
        </p>
      </div>
    </div>
  );
}

export default QuickActions;