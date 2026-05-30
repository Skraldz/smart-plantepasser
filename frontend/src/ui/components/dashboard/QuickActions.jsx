import { useState } from 'react';
import { updateLightSettings } from '../../../api/plantepasserApi';
import { useToast } from '../ToastProvider';

function QuickActions({
  lampStatus,
  systemNotices = [],
  plants = [],
  selectedWaterPlantIdx = '',
  setSelectedWaterPlantIdx = () => {},
  onWateringCycle,
  onToggleLamp,
  onRefreshSensors,
}) {
  const { showToast } = useToast();

  const [isLightConfigOpen, setIsLightConfigOpen] = useState(false);
  const [luxLow, setLuxLow] = useState(150);
  const [luxHigh, setLuxHigh] = useState(600);
  const [lightPeriod, setLightPeriod] = useState(16);
  const [lightStartHour, setLightStartHour] = useState(6);
  const [lightEnabled, setLightEnabled] = useState(1);
  const [isSavingLight, setIsSavingLight] = useState(false);

  async function handleSaveLightSettings() {
    try {
      setIsSavingLight(true);

      await updateLightSettings(3, {
        lux_threshold_low: Number(luxLow),
        lux_threshold_high: Number(luxHigh),
        light_period: Number(lightPeriod),
        light_start_hour: Number(lightStartHour),
        enabled: Number(lightEnabled),
      });

      showToast('Light settings updated.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update light settings.', 'error');
    } finally {
      setIsSavingLight(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>

      <p className="mt-1 text-sm text-slate-400">
        Manual controls and shortcuts.
      </p>

      <div className="mt-6 space-y-4">
        <select
          value={selectedWaterPlantIdx}
          onChange={(e) => setSelectedWaterPlantIdx(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
        >
          <option value="">Choose plant to water</option>

          {plants.map((plant) => (
            <option key={plant.id} value={plant.plant_idx}>
              {plant.name} — Pump {plant.plant_idx}
            </option>
          ))}
        </select>

        <button
          onClick={onWateringCycle}
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Start watering cycle
        </button>

        <button
          onClick={onToggleLamp}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Toggle growth lamp
        </button>

        <p className="text-sm text-slate-400">
          Lamp is currently {lampStatus}.
        </p>

        <button
          type="button"
          onClick={() => setIsLightConfigOpen((current) => !current)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          {isLightConfigOpen ? 'Hide light configuration' : 'Configure light'}
        </button>

        {isLightConfigOpen && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">
              Light automation
            </h3>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-300">
                Low lux threshold
              </label>
              <select
                value={luxLow}
                onChange={(e) => setLuxLow(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
              >
                <option value={50}>50 lux</option>
                <option value={100}>100 lux</option>
                <option value={150}>150 lux</option>
                <option value={200}>200 lux</option>
                <option value={300}>300 lux</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-300">
                High lux threshold
              </label>
              <select
                value={luxHigh}
                onChange={(e) => setLuxHigh(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
              >
                <option value={400}>400 lux</option>
                <option value={500}>500 lux</option>
                <option value={600}>600 lux</option>
                <option value={800}>800 lux</option>
                <option value={1000}>1000 lux</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-300">
                Light period
              </label>
              <select
                value={lightPeriod}
                onChange={(e) => setLightPeriod(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
              >
                <option value={8}>8 hours</option>
                <option value={12}>12 hours</option>
                <option value={16}>16 hours</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-300">
                Start hour
              </label>
              <select
                value={lightStartHour}
                onChange={(e) => setLightStartHour(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-300">
                Automation
              </label>
              <select
                value={lightEnabled}
                onChange={(e) => setLightEnabled(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
              >
                <option value={1}>Enabled</option>
                <option value={0}>Disabled</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSaveLightSettings}
              disabled={isSavingLight}
              className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isSavingLight ? 'Saving...' : 'Save light settings'}
            </button>
          </div>
        )}

        <button
          onClick={onRefreshSensors}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Refresh sensor data
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <h3 className="text-lg font-semibold text-white">System Notice</h3>

        <div className="mt-3 space-y-2">
          {systemNotices.map((notice, index) => (
            <div
              key={index}
              className={`rounded-xl px-3 py-2 text-sm ${
                notice.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-300'
                  : notice.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'bg-blue-500/10 text-blue-300'
              }`}
            >

              {notice.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;