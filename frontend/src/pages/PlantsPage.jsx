import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../ui/components/ToastProvider';

function PlantsPage() {
  const { showToast } = useToast();

  const [plants, setPlants] = useState([
    {
      id: 1,
      sensor_module_id: 101,
      plant_idx: 1,
      name: 'Monstera Deliciosa',
    },
    {
      id: 2,
      sensor_module_id: 101,
      plant_idx: 2,
      name: 'Ficus Elastica',
    },
    {
      id: 3,
      sensor_module_id: 102,
      plant_idx: 1,
      name: 'Snake Plant',
    },
  ]);

  function handleDeletePlant(id, name) {
    const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);

    if (!confirmed) return;

    setPlants((currentPlants) =>
      currentPlants.filter((plant) => plant.id !== id)
    );

    showToast(`${name} deleted successfully.`, 'warning');
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

      {plants.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-400">
          No plants registered yet.
        </div>
      ) : (
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