/* RegisterPlantPage.jsx defines the RegisterPlantPage component, rendering a form for users to register a new plant in their cluster. 
It allows users to input plant details such as name, species, location, and notes, and handles form submission by sending the data to the backend API. 
The component also provides feedback to the user through toast notifications based on the success or failure of the registration process. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/components/ToastProvider';
import { useClusters } from '../ui/components/ClusterProvider'; // Custom hook for accessing cluster-related state and functions
import { createPlant } from '../api/plantepasserApi'; // Importing the createPlant function from the plantepasser API to handle plant creation requests to the backend

// The RegisterPlantPage component renders a form for registering a new plant
function RegisterPlantPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    clusters,
    selectedCluster,
    selectedClusterId,
    setSelectedClusterId,
  } = useClusters();

  const [plantName, setPlantName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [plantIdx, setPlantIdx] = useState(0);

  // Handles form submission by calling the createPlant API function and managing the registration flow 
  async function handleSubmit(e) {
    e.preventDefault();

    // Constructing the plant data object to be sent to the backend API for creating a new plant
    try {
      const plantData = {
        plant_idx: Number(plantIdx),
        name: plantName,
        type: species,
        location,
        note: notes,
        soil_threshold: 30,
        pump_pwm: 100,
        watering_duration_sec: 5,
      };

      // Calling the createPlant function from the plantepasser API to send the plant data to the backend and create a new plant entry
      await createPlant(selectedCluster.sensorModuleId, plantData);

      showToast('Plant registered successfully.', 'success');
      navigate('/plants');
    } catch (err) {
      console.error(err);

      // Handling specific error case where a plant already exists at the selected plant position, and providing user feedback through a toast notification
      if (err.response?.status === 409) {
        showToast(
          'A plant already exists at this plant position.',
          'warning'
        );
        return;
      }

      showToast('Failed to register plant.', 'error');
    }
  }

  // The JSX structure of the register plant page, including a form for user input and selection of cluster and plant position.
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Register Plant
        </h1>

        <p className="mt-2 max-w-2xl text-slate-400">
          Add a new plant to your dashboard.
        </p>
      </div>

      <div className="max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-lg">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Cluster
            </label>

            <select
              value={selectedClusterId}
              onChange={(e) => setSelectedClusterId(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            >
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.name} — {cluster.status}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Prototype: each cluster represents one hub with up to 4 connected
              plants.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Plant position
            </label>

            <select
              value={plantIdx}
              onChange={(e) => setPlantIdx(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={0}>Slot 0</option>
              <option value={1}>Slot 1</option>
              <option value={2}>Slot 2</option>
              <option value={3}>Slot 3</option>
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Each cluster supports four physical plant positions: 0–3.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Plant name
            </label>

            <input
              type="text"
              placeholder="e.g. Monstera in kitchen"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Species
            </label>

            <input
              type="text"
              placeholder="e.g. Monstera Deliciosa"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Location
            </label>

            <input
              type="text"
              placeholder="e.g. Living room"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Notes
            </label>

            <textarea
              placeholder="Optional notes about care, placement, or setup"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Register plant
          </button>
        </form>
      </div>
    </div>
  );
}
// Exporting the RegisterPlantPage component as the default export of this module, allowing it to be imported and used in other parts of the application.
export default RegisterPlantPage;