import { useState } from 'react';
import { updatePlant } from '../../../api/plantepasserApi';
import { useToast } from '../ToastProvider';
import { usePlants } from '../PlantProvider';

function PlantStatusCard({ plant }) {
  const { showToast } = useToast();
  const { refreshPlants } = usePlants();

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [soilThreshold, setSoilThreshold] = useState(
    plant.soil_threshold ?? 30
  );

  const [pumpPwm, setPumpPwm] = useState(
    plant.pump_pwm ?? 100
  );

  const [wateringDuration, setWateringDuration] = useState(
    plant.watering_duration_sec ?? 5
  );

  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveSettings() {
    try {
      setIsSaving(true);

      await updatePlant(
        plant.plant_idx,
        plant.sensor_module_id,
        {
          soil_threshold: Number(soilThreshold),
          pump_pwm: Number(pumpPwm),
          watering_duration_sec: Number(wateringDuration),
        }
      );

      await refreshPlants();

      showToast(`${plant.name} settings updated.`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`Failed to update ${plant.name}.`, 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <h3 className="text-lg font-semibold text-white">
        {plant.name}
      </h3>

      <div className="mt-3 space-y-1">
        <p className="text-sm text-slate-400">
          Plant index: {plant.plant_idx}
        </p>

        <p className="text-sm text-slate-400">
          Sensor module ID: {plant.sensor_module_id}
        </p>

        <p className="text-sm text-slate-400">
          Soil moisture:{' '}
          {plant.statusData?.soil_moisture ?? 'No data'}%
        </p>

        <p className="text-sm text-slate-400">
          Temperature:{' '}
          {plant.statusData?.temperature ?? 'No data'}°C
        </p>

        <p className="text-sm text-slate-400">
          Humidity:{' '}
          {plant.statusData?.humidity ?? 'No data'}%
        </p>

        <p className="text-sm text-slate-400">
          Lux: {plant.statusData?.lux ?? 'No data'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsConfigOpen((current) => !current)}
        className="mt-5 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {isConfigOpen ? 'Hide configuration' : 'Configure plant'}
      </button>

      {isConfigOpen && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <h4 className="text-sm font-semibold text-white">
            Automation settings
          </h4>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">
              Soil threshold
            </label>

            <select
              value={soilThreshold}
              onChange={(e) => setSoilThreshold(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            >
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={30}>30%</option>
              <option value={40}>40%</option>
              <option value={50}>50%</option>
              <option value={60}>60%</option>
              <option value={70}>70%</option>
              <option value={80}>80%</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">
              Pump strength
            </label>

            <select
              value={pumpPwm}
              onChange={(e) => setPumpPwm(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            >
              <option value={25}>25%</option>
              <option value={50}>50%</option>
              <option value={75}>75%</option>
              <option value={100}>100%</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">
              Watering duration
            </label>

            <select
              value={wateringDuration}
              onChange={(e) => setWateringDuration(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            >
              <option value={1}>1 second</option>
              <option value={3}>3 seconds</option>
              <option value={5}>5 seconds</option>
              <option value={8}>8 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={20}>20 seconds</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      )}
    </div>
  );
}

export default PlantStatusCard;