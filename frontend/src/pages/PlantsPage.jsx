/*PlantsPage.jsx defines the PlantsPage component, which renders a page displaying a list of registered plants,
 allowing users to view, edit, and delete plant information.*/
import { useEffect, useState } from 'react'; // React hooks for managing component state and side effects
import { Link } from 'react-router-dom'; // Link component from react-router-dom for navigation between routes
// Importing API functions for interacting with the backend to manage plants
import {
  deletePlant,
  getPlants,
  updatePlant,
} from '../api/plantepasserApi';

import { useToast } from '../ui/components/ToastProvider'; // Custom hook for showing toast notifications to the user
import { usePlants } from '../ui/components/PlantProvider'; // Custom hook for accessing and managing plant data across the application

// This component renders the PlantsPage, which displays a list of registered plants and allows the user to view, edit, and delete them.
function PlantsPage() {
  const { showToast } = useToast(); // Destructuring the showToast function from the useToast hook to display notifications
  const { refreshPlants } = usePlants(); // Destructuring the refreshPlants function from the usePlants hook to refresh the plant data after updates

  const [plants, setPlants] = useState([]); // State variable to hold the list of plants fetched from the backend
  const [isLoading, setIsLoading] = useState(true); // State variable to track whether the plant data is currently being loaded
  const [error, setError] = useState(''); // State variable to hold any error messages that occur during data fetching or manipulation
  const [editingPlantIdx, setEditingPlantIdx] = useState(null); // State variable to track which plant is currently being edited, identified by its plant index
  
  // State variable to hold the form data for editing a plant's details, initialized with empty values
  const [editForm, setEditForm] = useState({ 
    name: '',
    type: '',
    location: '',
    note: '',
  });

  // useEffect hook to load the plant data from the backend when the component mounts. 
  // It defines an async function loadPlants that fetches the plants and updates the state accordingly, handling loading and error states.
  useEffect(() => {
    async function loadPlants() {
      try {
        setIsLoading(true);
        setError('');

        const data = await getPlants(1); // Fetching the list of plants for sensor module ID 1 from the backend API
        setPlants(data); // Updating the plants state variable with the fetched data
      } catch (err) { 
        console.error(err);
        setError('Could not load plants from backend.');
        showToast('Could not load plants from backend.', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadPlants(); // Calling the loadPlants function to initiate the data fetching when the component mounts
  }, [showToast]);

  /*Function to start editing a plant,
   which sets the editingPlantIdx to the plant's index and populates the editForm state with the plant's current details.*/
  function startEditingPlant(plant) {
    setEditingPlantIdx(plant.plant_idx);
    setEditForm({
      name: plant.name || '',
      type: plant.type || '',
      location: plant.location || '',
      note: plant.note || '',
    });
  }

  // Function to cancel editing a plant, which resets the editingPlantIdx and clears the editForm state.
  function cancelEditingPlant() {
    setEditingPlantIdx(null);
    setEditForm({
      name: '',
      type: '',
      location: '',
      note: '',
    });
  }

  // Function to save the edited plant details, which updates the plant in the backend and refreshes the plant list.
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
      // Optimistically update the plant in the local state before refreshing from the backend
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
      // Refresh the plant list from the backend to ensure we have the latest data after the update
      await refreshPlants();

      showToast(`${editForm.name} updated successfully.`, 'success');
      cancelEditingPlant();
    } catch (err) {
      console.error(err);
      showToast(`Failed to update ${plant.name}.`, 'error');
    }
  }

  /*Function to handle deleting a plant, which confirms the action with the user, 
   deletes the plant from the backend, and refreshes the plant list. */
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

  /* The JSX structure of the PlantsPage, 
  which includes a header, a link to register a new plant, and conditional rendering for loading state, error messages, 
  and the list of plants with edit and delete options. */
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

/*Exporting the PlantsPage component as the default export of this module, 
 allowing it to be imported and used in other parts of the application. */
export default PlantsPage;