import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlants } from '../api/plantepasserApi';
import { useToast } from '../ui/components/ToastProvider';

function PlantsPage() {
  const { showToast } = useToast();

  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPlants() {
      try {
        setIsLoading(true);
        setError('');

        const data = await getPlants(1);
        setPlants(data);
      } catch (err) {
        console.error(err);
        setError('Could not load plants from backend.');
        showToast('Could not load plants from backend.', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadPlants();
  }, [showToast]);

  function handleDeletePlant(id, name) {
    showToast(
      `Delete is not connected to backend yet for ${name}.`,
      'warning'
    );
  }

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">All Plants</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            View registered plants connected to your modules.
          </p>
        </div>

        <Link
          to="/plants/register"
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Register plant
        </Link>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-400">
          Loading plants...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      )}

      {!isLoading && !error && plants.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-400">
          No plants registered yet.
        </div>
      )}

      {!isLoading && !error && plants.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plants.map((plant) => (
            <div
              key={plant.id}
              className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{plant.name}</h3>

                <button
                  onClick={() => handleDeletePlant(plant.id, plant.name)}
                  className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Plant index: {plant.plant_idx}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Sensor module ID: {plant.sensor_module_id}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default PlantsPage;