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

function CustomXAxisTick({ x, y, payload }) {
  const [time, date] = String(payload.value).split('|');

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#94a3b8" fontSize={12}>
        <tspan x="0" dy="0">
          {time}
        </tspan>

        {date && (
          <tspan x="0" dy="18" fill="#64748b" fontSize={11}>
            {date}
          </tspan>
        )}
      </text>
    </g>
  );
}

function getPlantReadings(measurement) {
  return (
    measurement.plants ||
    measurement.soil_readings ||
    measurement.plant_readings ||
    []
  );
}

function getSoilMoisture(measurement, selectedPlantIdx, plants) {
  const plantReadings = getPlantReadings(measurement);

  const selectedPlant = plants.find(
    (plant) => Number(plant.plant_idx) === Number(selectedPlantIdx)
  );

  const soilReading = plantReadings.find((reading) => {
    const readingPlantId =
      reading.plant_id ??
      reading.plant_idx ??
      reading.plantId;

    return (
      Number(readingPlantId) === Number(selectedPlantIdx) ||
      Number(readingPlantId) === Number(selectedPlant?.id)
    );
  });

  return soilReading?.soil_moisture ?? soilReading?.soilMoisture ?? null;
}

function average(values) {
  const validValues = values.filter((value) => value != null);

  if (validValues.length === 0) return null;

  return Math.round(
    validValues.reduce((sum, value) => sum + Number(value), 0) /
      validValues.length
  );
}

function HistoryChart({ measurements, plants, historyRange }) {
  const [selectedPlantIdx, setSelectedPlantIdx] = useState(0);
  const [chartMode, setChartMode] = useState('auto');

  const [selectedMetrics, setSelectedMetrics] = useState({
    soil: true,
    temperature: false,
    humidity: false,
    lux: false,
  });

  const chartData = useMemo(() => {
    const shouldAggregateByDay =
      chartMode === 'daily' ||
      (chartMode === 'auto' && historyRange > 24);

    if (shouldAggregateByDay) {
      const groupedByDate = measurements.reduce((groups, measurement) => {
        const dateObject = new Date(measurement.timestamp);

        const dateKey = dateObject.toLocaleDateString('da-DK', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        });

        if (!groups[dateKey]) {
          groups[dateKey] = {
            soil: [],
            temperature: [],
            humidity: [],
            lux: [],
          };
        }

        groups[dateKey].soil.push(
          getSoilMoisture(measurement, selectedPlantIdx, plants)
        );
        groups[dateKey].temperature.push(measurement.temperature ?? null);
        groups[dateKey].humidity.push(measurement.humidity ?? null);
        groups[dateKey].lux.push(measurement.lux ?? null);

        return groups;
      }, {});

      return Object.entries(groupedByDate).map(([date, values]) => ({
        time: `Avg|${date}`,
        tooltipTime: `${date} (daily average)`,
        soil: average(values.soil),
        temperature: average(values.temperature),
        humidity: average(values.humidity),
        lux: average(values.lux),
      }));
    }

    let previousDate = '';

    return measurements.map((measurement) => {
      const dateObject = new Date(measurement.timestamp);

      const time = dateObject.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const date = dateObject.toLocaleDateString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });

      const shouldShowDate = date !== previousDate;
      previousDate = date;

      return {
        time: shouldShowDate ? `${time}|${date}` : `${time}|`,
        tooltipTime: dateObject.toLocaleString('da-DK', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        soil: getSoilMoisture(measurement, selectedPlantIdx, plants),
        temperature: measurement.temperature ?? null,
        humidity: measurement.humidity ?? null,
        lux: measurement.lux ?? null,
      };
    });
  }, [measurements, selectedPlantIdx, plants, historyRange, chartMode]);

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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="w-full min-w-56">
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

          <div className="w-full min-w-56">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Chart mode
            </label>

            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
            >
              <option value="auto">Auto</option>
              <option value="all">All readings</option>
              <option value="daily">Daily average</option>
            </select>
          </div>
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

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 95 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="time"
              tick={<CustomXAxisTick />}
              interval="preserveStartEnd"
              minTickGap={40}
              height={86}
              tickMargin={24}
            />

            <YAxis />
           <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const data = payload[0].payload;

              return (
                <div className="rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white shadow-lg">
                  <p className="mb-2 font-semibold text-slate-200">
                    {data.tooltipTime}
                  </p>

                  {payload.map((item) => (
                    <p key={item.dataKey} className="text-slate-300">
                      {item.name}: {item.value}
                    </p>
                  ))}
                </div>
              );
            }}
          />

            {selectedMetrics.soil && (
              <Line
                type="monotone"
                dataKey="soil"
                name="Soil moisture"
                strokeWidth={4}
                connectNulls
              />
            )}

            {selectedMetrics.temperature && (
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                strokeWidth={4}
                connectNulls
              />
            )}

            {selectedMetrics.humidity && (
              <Line
                type="monotone"
                dataKey="humidity"
                name="Humidity"
                strokeWidth={4}
                connectNulls
              />
            )}

            {selectedMetrics.lux && (
              <Line
                type="monotone"
                dataKey="lux"
                name="Lux"
                strokeWidth={4}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HistoryChart;