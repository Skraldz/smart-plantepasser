// This component uses the Recharts library to display a line chart of historical plant data.
import { useMemo, useState } from 'react'; // React hooks for managing component state and memoizing values
import { // Recharts components for building the line chart
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Helper function to parse timestamps from the backend, ensuring they are treated as UTC if no timezone is provided.
function parseBackendTimestamp(timestamp) {
  if (!timestamp) return new Date();

  const hasTimezone =
    timestamp.endsWith('Z') ||
    /[+-]\d{2}:\d{2}$/.test(timestamp);

  return new Date(hasTimezone ? timestamp : `${timestamp}Z`);
}

// Custom tick component for the X-axis to display time and date in a more readable format.
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

// The HistoryChart component takes in measurements, plant information, and the history range as props to display a line chartover time.
// includes options for selecting which metrics to display and how to aggregate the data based on the history range.
function getPlantReadings(measurement) {
  return (
    measurement.plants ||
    measurement.soil_readings ||
    measurement.plant_readings ||
    []
  );
}

// Helper function to extract soil moisture readings for a specific plant from a measurement,
//  accounting for different possible data structures and ensuring compatibility with both plant index and plant ID.
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

// Helper function to calculate the average of an array of values, ignoring null or undefined values, 
// and returning null if there are no valid values to average.
function average(values) {
  const validValues = values.filter((value) => value != null);

  if (validValues.length === 0) return null;

  return Math.round(
    validValues.reduce((sum, value) => sum + Number(value), 0) /
      validValues.length
  );
}

// The main component that renders the history chart, allowing users to select a plant and which metrics to display,
function HistoryChart({ measurements, plants, historyRange }) {
  const [selectedPlantIdx, setSelectedPlantIdx] = useState(0);
  const [chartMode, setChartMode] = useState('auto');

  const [selectedMetrics, setSelectedMetrics] = useState({
    soil: true,
    temperature: false,
    humidity: false,
    lux: false,
  });

  // Memoized calculation of the chart data based on the measurements, selected plant, and chart mode.
  const chartData = useMemo(() => {
    const shouldAggregateByDay =
      chartMode === 'daily' ||
      (chartMode === 'auto' && historyRange > 24);

    if (shouldAggregateByDay) {
      const groupedByDate = measurements.reduce((groups, measurement) => {
        const dateObject = parseBackendTimestamp(measurement.timestamp);

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

  // Grouping soil moisture, temperature, humidity, and lux readings by date for averaging later, 
  // using the getSoilMoisture helper function to extract the relevant soil moisture reading for the selected plant.
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

    let previousDate = ''; // Variable to track the previous date for determining when to show the date label on the X-axis ticks.

    // Mapping the raw measurements to the format needed for the chart, including formatting the time and date for the X-axis.
    return measurements.map((measurement) => {
      const dateObject = parseBackendTimestamp(measurement.timestamp);

      const time = dateObject.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Format the date for display on the X-axis, and determine whether to show the date label based on whether it has changed from the previous measurement.
      const date = dateObject.toLocaleDateString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });

      // If the date has changed from the previous measurement, include it in the time string for the X-axis tick; otherwise, only show the time.
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
        // Extract the soil moisture reading for the selected plant using the helper function.
        soil: getSoilMoisture(measurement, selectedPlantIdx, plants),
        temperature: measurement.temperature ?? null,
        humidity: measurement.humidity ?? null,
        lux: measurement.lux ?? null,
      };
    });
  }, [measurements, selectedPlantIdx, plants, historyRange, chartMode]);

  // Function to toggle the visibility of a specific metric on the chart by updating the selectedMetrics state.
  function toggleMetric(metric) {
    setSelectedMetrics((current) => ({
      ...current,
      [metric]: !current[metric],
    }));
  }

  // If there are no measurements available, display a message indicating that historical data is not yet available.
  if (!measurements || measurements.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-400">
        No historical measurement data available yet.
      </div>
    );
  }

  // The main JSX structure of the HistoryChart component, including the header, plant and chart mode selectors, metric toggles, and the line chart itself.
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

// Exporting the HistoryChart component as the default export of this module, allowing it to be imported and used in other parts of the application.
export default HistoryChart;