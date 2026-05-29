/* import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function MoistureChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-400">
        No measurement data available yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white">
        Moisture History
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Soil moisture readings from the last 24 hours.
      </p>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="plant0"
              name="Plant 0"
            />

            <Line
              type="monotone"
              dataKey="plant1"
              name="Plant 1"
            />

            <Line
              type="monotone"
              dataKey="plant2"
              name="Plant 2"
            />

            <Line
              type="monotone"
              dataKey="plant3"
              name="Plant 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MoistureChart;