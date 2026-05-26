import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../ui/components/ToastProvider';
import { usePlants } from '../ui/components/PlantProvider';

import {
  sendRelayCommand,
  sendWaterCommand,
} from '../api/plantepasserApi';

function DashboardPage() {
  const [lampStatus, setLampStatus] = useState('On');
  const { showToast } = useToast();
  const { plants, refreshPlants } = usePlants();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPlants();
    }, 1800000);

    return () => clearInterval(interval);
  }, [refreshPlants]);

async function handleWateringCycle() {
  try {
    if (plants.length === 0) {
      showToast('No plants available for watering.', 'warning');
      return;
    }

    await sendWaterCommand(plants[0].plant_idx, 5);

    showToast('Watering command sent successfully.', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to send watering command.', 'error');
  }
}


async function handleToggleLamp() {
  try {
    const nextRelayAction = lampStatus === 'On' ? 0 : 1;

    await sendRelayCommand(nextRelayAction);

    const nextStatus = nextRelayAction === 1 ? 'On' : 'Off';

    setLampStatus(nextStatus);

    showToast(
      `Growth lamp turned ${nextStatus.toLowerCase()}.`,
      'success'
    );
  } catch (err) {
    console.error(err);
    showToast('Failed to toggle growth lamp.', 'error');
  }
}

async function handleRefreshSensors() {
  try {
    await refreshPlants();
    showToast('Sensor data refreshed.', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to refresh sensor data.', 'error');
  }
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
          <h2 className="mt-3 text-3xl font-bold text-white">{plants.length}</h2>
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
          {plants.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-slate-400">No plants registered yet.</p>
            </div>
          ) : (
            plants.map((plant) => (
              <div
                key={plant.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
              >
                <h3 className="text-lg font-semibold text-white">
                  {plant.name}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Plant index: {plant.plant_idx}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Sensor module ID: {plant.sensor_module_id}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Soil moisture: {plant.statusData?.soil_moisture ?? 'No data'}%
                </p>

                <p className="mt-1 text-sm text-slate-400">
                   Temperature: {plant.statusData?.temperature ?? 'No data'}°C
                </p>

                <p className="mt-1 text-sm text-slate-400">
                    Humidity: {plant.statusData?.humidity ?? 'No data'}%
                </p>

                <p className="mt-1 text-sm text-slate-400">
                    Lux: {plant.statusData?.lux ?? 'No data'}
                </p>

                <p className="mt-1 text-sm text-emerald-400">
                    Lamp:{' '}
                    {plant.statusData?.lamp_on == null
                      ? 'No data'
                      : plant.statusData.lamp_on === 1
                        ? 'On'
                        : 'Off'}
                </p>
              </div>
            ))
          )}
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