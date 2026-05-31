// This component provides quick action buttons for manual controls and shortcuts related to plant care
// It includes options for starting a watering cycle, toggling the growth lamp, configuring light automation settings, and refreshing sensor data.
import { useState } from 'react';
import { updateLightSettings } from '../../../api/plantepasserApi';
import { useToast } from '../ToastProvider';

// The QuickActions component takes various props for managing lamp status, system notices, plant information, and action handlers
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
  const { showToast } = useToast(); // Custom hook for displaying toast notifications to the user
  const [isLightConfigOpen, setIsLightConfigOpen] = useState(false); // State for managing the visibility of the light configuration section
  const [luxLow, setLuxLow] = useState(150); //
  const [luxHigh, setLuxHigh] = useState(600);
  const [lightPeriod, setLightPeriod] = useState(16); 
  const [lightStartHour, setLightStartHour] = useState(6);
  const [lightEnabled, setLightEnabled] = useState(1);
  const [isSavingLight, setIsSavingLight] = useState(false); // State for managing the saving state of the light configuration settings

  // Function to handle saving the light automation settings, including making an API call to update the settings
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

  // The JSX structure of the QuickActions component, including buttons for manual controls and a section for system notices.
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

            <input
              type="number"
              min="0"
              value={luxLow}
              onChange={(e) => setLuxLow(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">
              High lux threshold
            </label>

            <input
              type="number"
              min="0"
              value={luxHigh}
              onChange={(e) => setLuxHigh(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">
              Light period (hours)
            </label>

            <input
              type="number"
              min="1"
              max="24"
              value={lightPeriod}
              onChange={(e) => setLightPeriod(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">
              Start hour
            </label>

            <input
              type="number"
              min="0"
              max="23"
              value={lightStartHour}
              onChange={(e) => setLightStartHour(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            />
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

// Exporting the QuickActions component as the default export of this module, allowing it to be imported and used in other parts of the application.
export default QuickActions;