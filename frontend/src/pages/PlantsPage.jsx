import { Link } from 'react-router-dom';

function PlantsPage() {
  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">All Plants</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            View the complete list of registered plants and their current status.
          </p>
        </div>

        <Link
          to="/plants/register"
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Register plant
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['Monstera Deliciosa', '72%', 'Good', 'Healthy'],
          ['Ficus Elastica', '59%', 'Medium', 'Needs attention'],
          ['Calathea Orbifolia', '81%', 'High', 'Healthy'],
          ['Snake Plant', '44%', 'Low', 'Stable'],
          ['Peace Lily', '66%', 'Medium', 'Healthy'],
          ['Aloe Vera', '38%', 'High', 'Stable'],
        ].map(([name, moisture, light, status]) => (
          <div
            key={name}
            className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="mt-2 text-sm text-slate-400">Soil moisture: {moisture}</p>
            <p className="mt-1 text-sm text-slate-400">Light exposure: {light}</p>
            <p
              className={`mt-1 text-sm ${
                status === 'Needs attention' ? 'text-yellow-400' : 'text-emerald-400'
              }`}
            >
              Status: {status}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default PlantsPage;