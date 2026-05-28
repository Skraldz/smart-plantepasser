import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../ui/components/ToastProvider';
import { usePlants } from '../ui/components/PlantProvider';
import { useClusters } from '../ui/components/ClusterProvider';

import PlantStatusCard from '../ui/components/dashboard/PlantStatusCard';
import QuickActions from '../ui/components/dashboard/QuickActions';
import MoistureChart from '../ui/components/dashboard/MoistureChart';


import {
  getMeasurements,
  sendRelayCommand,
  sendWaterCommand,
} from '../api/plantepasserApi';



function DashboardPage() {
  const [lampStatus, setLampStatus] = useState('On');
  const { showToast } = useToast();
  const { plants, refreshPlants } = usePlants();
  const [moistureHistory, setMoistureHistory] = useState([]);

// Cluster context provides the list of clusters and the currently selected cluster
const {
  clusters,
  selectedClusterId,
  setSelectedClusterId,
} = useClusters();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPlants();
    }, 1800000);

    return () => clearInterval(interval);
  }, [refreshPlants]);

  useEffect(() => {
    async function loadMeasurements() {
     try {
      const measurements = await getMeasurements(1, 24, 0);

      console.log(measurements);

      const chartData = measurements.map((measurement) => {
        const row = {
          time: new Date(measurement.timestamp).toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        measurement.soil_readings.forEach((reading) => {
          row[`plant${reading.plant_idx}`] = reading.soil_moisture;
        });

        return row;
      });

      setMoistureHistory(chartData);
    } catch (err) {
      console.error(err);
      showToast('Could not load measurement history.', 'error');
    }
  }

  loadMeasurements();
}, [showToast]);

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
      <div className="mt-6 max-w-sm">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Selected cluster
        </label>

        <select
          value={selectedClusterId}
          onChange={(e) => setSelectedClusterId(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
  >
          {clusters.map((cluster) => (
            <option key={cluster.id} value={cluster.id}>
              {cluster.name} — {cluster.status}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-slate-500">
          Concept: each cluster represents one hub with up to 4 plants, watering, and lamp control.
        </p>
      </div>
      </div>

      <section className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Active Plants</p>
          <h2 className="mt-3 text-3xl font-bold text-white">{plants.length}</h2>
          <p className="mt-2 text-sm text-slate-400">Maximum 4 plants per cluster</p>
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
              <PlantStatusCard key={plant.id} plant={plant} />
            ))
          )}
          </div>
        </div>

        <QuickActions
          lampStatus={lampStatus}
          onWateringCycle={handleWateringCycle}
          onToggleLamp={handleToggleLamp}
          onRefreshSensors={handleRefreshSensors}
        />
      </section>
      <section className="mt-6">
        <MoistureChart data={moistureHistory} />
      </section>
    </div>
  );
}

export default DashboardPage;