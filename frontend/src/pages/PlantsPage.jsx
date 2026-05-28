import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deletePlant,
  getPlants,
  updatePlant,
} from '../api/plantepasserApi';
import { useToast } from '../ui/components/ToastProvider';
import { usePlants } from '../ui/components/PlantProvider';

function PlantsPage() {
  const { showToast } = useToast();
  const { refreshPlants } = usePlants();

  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPlantIdx, setEditingPlantIdx] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    location: '',
    note: '',
  });

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

  function startEditingPlant(plant) {
    setEditingPlantIdx(plant.plant_idx);
    setEditForm({
      name: plant.name || '',
      type: plant.type || '',
      location: plant.location || '',
      note: plant.note || '',
    });
  }

  function cancelEditingPlant() {
    setEditingPlantIdx(null);
    setEditForm({
      name: '',
      type: '',
      location: '',
      note: '',
    });
  }

  async function handleSavePlant(plant) {
    try {
      await updatePlant(
        plant.plant_idx,
        plant.sensor_module_id,
        {
          name: editForm.name,
          type: editForm.type,
          location: editForm.location,
          note: editForm.note,
        }
      );

      setPlants((currentPlants) =>
        currentPlants.map((currentPlant) =>
          currentPlant.plant_idx === plant.plant_idx
            ? {
                ...currentPlant,
                ...editForm,
              }
            : currentPlant
        )
      );

      await refreshPlants();

      showToast(`${editForm.name} updated successfully.`, 'success');
      cancelEditingPlant();
    } catch (err) {
      console.error(err);
      showToast(`Failed to update ${plant.name}.`, 'error');
    }
  }

  async function handleDeletePlant(plantIdx, sensorModuleId, name) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
      await deletePlant(plantIdx, sensorModuleId);

      await refreshPlants();

      setPlants((currentPlants) =>
        currentPlants.filter((plant) => plant.plant_idx !== plantIdx)
      );

      showToast(`${name} deleted successfully.`, 'warning');
    } catch (err) {
      console.error(err);
      showToast(`Failed to delete ${name}.`, 'error');
    }
  }

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            All Plants
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            View and manage registered plants connected to your modules.
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
          {plants.map((plant) => {
            const isEditing = editingPlantIdx === plant.plant_idx;

            return (
              <div
                key={plant.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">
                    {plant.name}
                  </h3>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        isEditing
                          ? cancelEditingPlant()
                          : startEditingPlant(plant)
                      }
                      className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>

                    <button
                      onClick={() =>
                        handleDeletePlant(
                          plant.plant_idx,
                          plant.sensor_module_id,
                          plant.name
                        )
                      }
                      className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {!isEditing ? (
                  <>
                    <p className="mt-4 text-sm text-slate-400">
                      Plant index: {plant.plant_idx}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Sensor module ID: {plant.sensor_module_id}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Type: {plant.type || 'Not set'}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Location: {plant.location || 'Not set'}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Note: {plant.note || 'None'}
                    </p>
                  </>
                ) : (
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Plant name
                      </label>
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((current) => ({
                            ...current,
                            name: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Type
                      </label>
                      <input
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm((current) => ({
                            ...current,
                            type: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Location
                      </label>
                      <input
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm((current) => ({
                            ...current,
                            location: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Note
                      </label>
                      <textarea
                        value={editForm.note}
                        onChange={(e) =>
                          setEditForm((current) => ({
                            ...current,
                            note: e.target.value,
                          }))
                        }
                        rows="3"
                        className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSavePlant(plant)}
                      className="w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Save changes
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default PlantsPage;