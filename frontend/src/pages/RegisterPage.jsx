import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/components/ToastProvider';

function RegisterPlantPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [sensorModuleId, setSensorModuleId] = useState('');
  const [plantIdx, setPlantIdx] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    console.log({
      name,
      sensor_module_id: Number(sensorModuleId),
      plant_idx: Number(plantIdx),
    });

    showToast('Plant registered successfully.', 'success');
    navigate('/plants');
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Register Plant</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Add a plant using the fields supported by the current backend model.
        </p>
      </div>

      <div className="max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-lg">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Plant name
            </label>
            <input
              type="text"
              placeholder="e.g. Monstera Deliciosa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Sensor module ID
            </label>
            <input
              type="number"
              placeholder="e.g. 101"
              value={sensorModuleId}
              onChange={(e) => setSensorModuleId(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-100">
              Plant index
            </label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={plantIdx}
              onChange={(e) => setPlantIdx(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              required
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