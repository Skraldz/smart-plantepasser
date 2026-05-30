// Dashboard page showing plant status cards, quick actions, and historical charts.

import { useEffect, useState } from 'react'; // React hooks for state and side effects
import { Link } from 'react-router-dom'; // For navigation links
import { useToast } from '../ui/components/ToastProvider'; // Custom hook for showing toast notifications
import { usePlants } from '../ui/components/PlantProvider'; // Custom hook for accessing plant data and actions
import { useClusters } from '../ui/components/ClusterProvider'; // Custom hook for accessing cluster data and actions

import PlantStatusCard from '../ui/components/dashboard/PlantStatusCard'; // Component to display individual plant status
import QuickActions from '../ui/components/dashboard/QuickActions'; // Component for displaying quick action buttons and system notices
import HistoryChart from '../ui/components/dashboard/HistoryChart'; // Component for displaying historical measurement charts

// API functions for fetching measurements and sending commands to the hub
import {
  getLightSettings,
  getMeasurements,
  sendRelayCommand,
  sendWaterCommand,
} from '../api/plantepasserApi';

// Main dashboard page component
function DashboardPage() {
  const [measurements, setMeasurements] = useState([]); // State for historical measurements data
  const [fromHours, setFromHours] = useState(24); // State for defining the time range for historical data (default to last 24 hours)
  const [toHours, setToHours] = useState(0); // State for defining the time range for historical data
  const { showToast } = useToast(); // Function to show toast notifications
  const { plants, refreshPlants } = usePlants(); // Access plant data and refresh function from PlantProvider
  const [selectedWaterPlantIdx, setSelectedWaterPlantIdx] = useState(''); // State for tracking which plant is selected for watering in the QuickActions component
  const [lightSettings, setLightSettings] = useState(null);

  // Cluster selection state and data
  const {
    clusters,
    selectedClusterId,
    setSelectedClusterId,
  } = useClusters();

// Determine lamp status from the latest measurement first.
// If measurements are not available yet, fall back to plant status data.
const latestMeasurement = measurements[0];

const lampStatus =
  lightSettings?.relay_action === 1
    ? 'On'
    : lightSettings?.relay_action === 0
      ? 'Off'
      : 'No data';
          
  console.log('Plants:', plants);
  console.log('Latest measurement:', measurements[0]);
  console.log('Light settings:', lightSettings);

  // Calculate average soil moisture across all plants that have a valid soil_moisture reading
  const plantsWithMoisture = plants.filter(
    (plant) => plant.statusData?.soil_moisture != null
  );

  // Average moisture is rounded to the nearest whole number. If no plants have moisture data, it will be null.
  const averageMoisture =
    plantsWithMoisture.length > 0
      ? Math.round(
          plantsWithMoisture.reduce(
            (sum, plant) => sum + plant.statusData.soil_moisture,
            0
          ) / plantsWithMoisture.length
        )
      : null;

  // Generate system notices based on plant status and lamp status, displayed in the QuickActions component.
  const systemNotices = [];

  plants.forEach((plant) => {
    const moisture = plant.statusData?.soil_moisture;
    const threshold = plant.soil_threshold ?? 30;

    if (moisture != null && moisture < threshold) {
      systemNotices.push({
        type: 'warning',
        message: `${plant.name} moisture is below threshold.`,
      });
    }
  });

  if (lampStatus === 'On') {
    systemNotices.push({
      type: 'info',
      message: 'Growth lamp is currently enabled.',
    });
  }

  if (lampStatus === 'Off') {
    systemNotices.push({
      type: 'info',
      message: 'Growth lamp is currently disabled.',
    });
  }

  if (systemNotices.length === 0) {
    systemNotices.push({
      type: 'success',
      message: 'All systems are operational. No critical alerts detected.',
    });
  }

  // Effect to refresh plant data every 30 minutes to keep the dashboard up-to-date with the latest sensor readings and statuses.
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPlants();
    }, 1800000);

    return () => clearInterval(interval);
  }, [refreshPlants]);

  // Effect to load historical measurements data whenever the selected time range (fromHours, toHours) changes.
  // This data is used for the HistoryChart component to visualize trends over time.
  useEffect(() => {
    async function loadMeasurements() {
      try {
        const data = await getMeasurements(1, fromHours, toHours);
        setMeasurements(data);
      } catch (err) {
        console.error(err);
        showToast('Could not load measurement history.', 'error');
      }
    }

  // Initial load of measurements when the component mounts and whenever the time range changes.
    loadMeasurements();
  }, [showToast, fromHours, toHours]);

  useEffect(() => {
    async function loadLightSettings() {
      try {
        const settings = await getLightSettings(3);
        setLightSettings(settings);
      } catch (err) {
        console.error(err);
      }
    }

    loadLightSettings();
  }, []);

// Handler for triggering a watering cycle for the selected plant. 
// It sends a water command to the backend and refreshes plant data to reflect the new status.
  async function handleWateringCycle() {
  try {
    if (!selectedWaterPlantIdx) {
      showToast('Choose a plant to water first.', 'warning');
      return;
    }

    await sendWaterCommand(Number(selectedWaterPlantIdx), 5);
    await refreshPlants();

    showToast(
      'Watering request submitted. Status will update when the hub responds.',
      'success'
    );
  } catch (err) {
    console.error(err);
    showToast('Failed to send watering command.', 'error');
  }
}
// Handler for toggling the growth lamp on or off. 
// It sends a relay command to the backend and refreshes plant data to reflect the new status.
  async function handleToggleLamp() {
    try {
      const nextRelayAction = lampStatus === 'On' ? 0 : 1;

      await sendRelayCommand(nextRelayAction);
      await refreshPlants();

     // const nextStatus = nextRelayAction === 1 ? 'On' : 'Off';

      showToast(
        `Lamp command sent. Current status will update when the hub reports back.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle growth lamp.', 'error');
    }
  }

  // Handler for refreshing sensor data. 
  // It fetches the latest plant data from the backend and updates the dashboard.
  async function handleRefreshSensors() {
    try {
      await refreshPlants();
      showToast('Sensor data refreshed.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to refresh sensor data.', 'error');
    }
  }

  // Handler for exporting measurement data to a CSV file.
  // It formats the measurement data into CSV format and triggers a download.
  function handleExportMeasurementsCsv() {
    if (!measurements || measurements.length === 0) {
      showToast('No measurement data available to export.', 'warning');
      return;
    }
  // Flatten the measurements data to create rows for the CSV. 
  // Each plant reading becomes a separate row with associated measurement data.
    const rows = measurements.flatMap((measurement) => {
      const plantReadings =
        measurement.plants || measurement.soil_readings || [];

      return plantReadings.map((plant) => ({
        timestamp: measurement.timestamp,
        plant_id: plant.plant_id ?? plant.plant_idx ?? '',
        soil_moisture: plant.soil_moisture ?? '',
        temperature: measurement.temperature ?? '',
        humidity: measurement.humidity ?? '',
        lux: measurement.lux ?? '',
        lamp_on: measurement.lamp_on ?? '',
      }));
    });
  // If there are no rows to export, show a warning and do not proceed with the CSV generation.
    if (rows.length === 0) {
      showToast('No measurement values available to export.', 'warning');
      return;
    }
  // Define CSV headers and construct the CSV content as a string.
    const headers = [
      'timestamp',
      'plant_id',
      'soil_moisture',
      'temperature',
      'humidity',
      'lux',
      'lamp_on',
    ];

  // The CSV string is created by joining the headers and rows with commas and newlines.
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => row[header] ?? '').join(',')
      ),
    ].join('\n');

    // Create a Blob from the CSV string and generate a download link for the user to save the file locally.
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    // Create a temporary URL for the Blob and trigger a download with a filename that includes the selected time range.
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `plant-measurements-${fromHours}-${toHours}.csv`;
    link.click();

    URL.revokeObjectURL(url); // Clean up the temporary URL after the download is triggered

    showToast('Measurement CSV exported.', 'success');
  }

  // The JSX structure of the dashboard page, including sections for cluster selection, summary cards, plant overview, 
  // quick actions, and historical charts
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
            Concept: each cluster represents one hub with up to 4 plants,
            watering, and lamp control.
          </p>
        </div>
      </div>

      <section className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Active Plants</p>
          <h2 className="mt-3 text-3xl font-bold text-white">
            {plants.length}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Maximum 4 plants per cluster
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Average Moisture</p>
          <h2 className="mt-3 text-3xl font-bold text-white">
            {averageMoisture == null ? 'No data' : `${averageMoisture}%`}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Calculated from current plant readings
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Lamp Status</p>
          <h2 className="mt-3 text-3xl font-bold text-white">{lampStatus}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Derived from latest backend status data
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm text-slate-400">Hub Connection</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Online</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sensor data refreshes every 30 minutes
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Plant Overview
              </h2>
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
          systemNotices={systemNotices}
          plants={plants}
          selectedWaterPlantIdx={selectedWaterPlantIdx}
          setSelectedWaterPlantIdx={setSelectedWaterPlantIdx}
          onWateringCycle={handleWateringCycle}
          onToggleLamp={handleToggleLamp}
          onRefreshSensors={handleRefreshSensors}
        />
      </section>

      <section className="mt-6">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              From hours ago
            </label>

            <input
              type="number"
              min="1"
              value={fromHours}
              onChange={(e) => setFromHours(Number(e.target.value))}
              className="w-32 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              To hours ago
            </label>

            <input
              type="number"
              min="0"
              value={toHours}
              onChange={(e) => setToHours(Number(e.target.value))}
              className="w-32 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <button
            onClick={() => {
              setFromHours(24);
              setToHours(0);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
              fromHours === 24 && toHours === 0
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Last 24h
          </button>

          <button
            onClick={() => {
              setFromHours(168);
              setToHours(0);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
              fromHours === 168 && toHours === 0
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Last 7d
          </button>

          <button
            onClick={() => {
              setFromHours(720);
              setToHours(0);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
              fromHours === 720 && toHours === 0
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Last 30d
          </button>

          <button
            onClick={handleExportMeasurementsCsv}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>

        <HistoryChart
          measurements={measurements}
          plants={plants}
          historyRange={fromHours}
        />
      </section>
    </div>
  );
}
// Export the DashboardPage component as the default export of this module.
export default DashboardPage;