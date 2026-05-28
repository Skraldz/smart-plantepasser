import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/components/ToastProvider';
import { useClusters } from '../ui/components/ClusterProvider';

function RegisterPlantPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { clusters, selectedClusterId, setSelectedClusterId } = useClusters();

  const [plantName, setPlantName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    console.log({
      plantName,
      species,
      location,
      notes,
      clusterId: selectedClusterId,
    });

    showToast('Plant registered successfully.', 'success');
    navigate('/plants');
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Register Plant</h1>
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
                Prototype: each cluster represents one hub with up to 4 connected plants.
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

export default RegisterPlantPage;