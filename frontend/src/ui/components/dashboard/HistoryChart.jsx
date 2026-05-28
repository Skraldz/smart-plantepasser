import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function HistoryChart({ measurements, plants }) {
  const [selectedPlantIdx, setSelectedPlantIdx] = useState(0);
  const [selectedMetrics, setSelectedMetrics] = useState({
    soil: true,
    temperature: false,
    humidity: false,
    lux: false,
  });

  const chartData = useMemo(() => {
  return measurements.map((measurement) => {
    const soilReading = measurement.plants?.find(
      (reading) => reading.plant_id === Number(selectedPlantIdx)
    );

    return {
      time: new Date(measurement.timestamp).toLocaleString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),

      soil: soilReading?.soil_moisture ?? null,
      temperature: measurement.temperature ?? null,
      humidity: measurement.humidity ?? null,
      lux: measurement.lux ?? null,
    };
  });
}, [measurements, selectedPlantIdx]);

  function toggleMetric(metric) {
    setSelectedMetrics((current) => ({
      ...current,
      [metric]: !current[metric],
    }));
  }

  if (!measurements || measurements.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-400">
        No historical measurement data available yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">History Chart</h2>
          <p className="mt-1 text-sm text-slate-400">
            Select a plant and choose which data points to display.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Plant
          </label>
          <select
            value={selectedPlantIdx}
            onChange={(e) => setSelectedPlantIdx(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
          >
            {plants.map((plant) => (
              <option key={plant.id} value={plant.plant_idx}>
                {plant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          ['soil', 'Soil moisture'],
          ['temperature', 'Temperature'],
          ['humidity', 'Humidity'],
          ['lux', 'Lux'],
        ].map(([metric, label]) => (
          <label
            key={metric}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-200"
          >
            <input
              type="checkbox"
              checked={selectedMetrics[metric]}
              onChange={() => toggleMetric(metric)}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />

            {selectedMetrics.soil && (
              <Line type="monotone" dataKey="soil" name="Soil moisture" />
            )}

            {selectedMetrics.temperature && (
              <Line type="monotone" dataKey="temperature" name="Temperature" />
            )}

            {selectedMetrics.humidity && (
              <Line type="monotone" dataKey="humidity" name="Humidity" />
            )}

            {selectedMetrics.lux && (
              <Line type="monotone" dataKey="lux" name="Lux" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HistoryChart;