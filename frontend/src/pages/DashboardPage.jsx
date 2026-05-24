import { useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [wateringStatus, setWateringStatus] = useState('');
  const [lampStatus, setLampStatus] = useState('On');
  const [sensorStatus, setSensorStatus] = useState('');

  function handleWateringCycle() {
    setWateringStatus('Starting watering cycle...');

    setTimeout(() => {
      setWateringStatus('Watering cycle started successfully.');
    }, 1000);
  }

  function handleToggleLamp() {
    setLampStatus((current) => (current === 'On' ? 'Off' : 'On'));
  }

  function handleRefreshSensors() {
    setSensorStatus('Refreshing sensor data...');

    setTimeout(() => {
      setSensorStatus('Sensor data refreshed.');
    }, 1000);
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Plant Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Monitor your plants, check system health, and trigger manual actions.
        </p>
      </div>

      <section className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Active Plants</p>
          <h2 className="mt-3 text-3xl font-bold text-white">12</h2>
          <p className="mt-2 text-sm text-emerald-400">+2 this week</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Average Moisture</p>
          <h2 className="mt-3 text-3xl font-bold text-white">68%</h2>
          <p className="mt-2 text-sm text-slate-400">Stable across all zones</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Lamp Status</p>
          <h2 className="mt-3 text-3xl font-bold text-white">{lampStatus}</h2>
          <p className="mt-2 text-sm text-emerald-400">Running on schedule</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Hub Connection</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Online</h2>
          <p className="mt-2 text-sm text-emerald-400">Last sync: 2 min ago</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Plant Overview</h2>
              <p className="text-sm text-slate-400">
                Quick summary of your monitored plants.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/plants"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View all plants
              </Link>

              <Link
                to="/plants/register"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Register plant
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold text-white">Monstera Deliciosa</h3>
              <p className="mt-2 text-sm text-slate-400">Soil moisture: 72%</p>
              <p className="mt-1 text-sm text-slate-400">Light exposure: Good</p>
              <p className="mt-1 text-sm text-emerald-400">Status: Healthy</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold text-white">Ficus Elastica</h3>
              <p className="mt-2 text-sm text-slate-400">Soil moisture: 59%</p>
              <p className="mt-1 text-sm text-slate-400">Light exposure: Medium</p>
              <p className="mt-1 text-sm text-yellow-400">Status: Needs attention</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold text-white">Calathea Orbifolia</h3>
              <p className="mt-2 text-sm text-slate-400">Soil moisture: 81%</p>
              <p className="mt-1 text-sm text-slate-400">Humidity: High</p>
              <p className="mt-1 text-sm text-emerald-400">Status: Healthy</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold text-white">Snake Plant</h3>
              <p className="mt-2 text-sm text-slate-400">Soil moisture: 44%</p>
              <p className="mt-1 text-sm text-slate-400">Light exposure: Low</p>
              <p className="mt-1 text-sm text-emerald-400">Status: Stable</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manual controls and shortcuts.
          </p>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleWateringCycle}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Start watering cycle
            </button>

            {wateringStatus && (
              <p className="text-sm text-emerald-400">{wateringStatus}</p>
            )}

            <button
              onClick={handleToggleLamp}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Toggle growth lamp
            </button>

            <p className="text-sm text-slate-400">Lamp is currently {lampStatus}.</p>

            <button
              onClick={handleRefreshSensors}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Refresh sensor data
            </button>

            {sensorStatus && (
              <p className="text-sm text-emerald-400">{sensorStatus}</p>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">System Notice</h3>
            <p className="mt-2 text-sm text-slate-400">
              All systems are operational. No critical alerts detected.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;