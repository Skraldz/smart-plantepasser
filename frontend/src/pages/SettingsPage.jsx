// SettingsPage.jsx defines the SettingsPage component, which serves as a central hub for managing various user settings
import { useState } from 'react'; // React hook for managing component state
import { useClusters } from '../ui/components/ClusterProvider';
import { useToast } from '../ui/components/ToastProvider';

// The SettingsPage component renders different sections for managing clusters, account settings, connected hub information, product key, and preferences.
function SettingsPage() {
  const { clusters, addCluster } = useClusters();
  const { showToast } = useToast();

  const [clusterName, setClusterName] = useState(''); // State for managing the cluster name input
  const [clusterDescription, setClusterDescription] = useState(''); // State for managing the cluster description input

  // Handles the form submission for adding a new cluster, including validation and updating the cluster state through the addCluster function from the ClusterProvider context.
  function handleAddCluster(e) {
    e.preventDefault();

    if (!clusterName.trim()) { // Validating that the cluster name is not empty before allowing the addition of a new cluster
      showToast('Cluster name is required.', 'warning');
      return;
    }

    addCluster({ // Adding a new cluster to the state with the provided name and description, and generating a sensor module ID based on the current number of clusters.
      name: clusterName,
      description:
        clusterDescription || 'Concept cluster for a future hub setup.',
      sensorModuleId: clusters.length + 1,
    });

    setClusterName(''); // Resetting the cluster name input field after successfully adding a new cluster
    setClusterDescription(''); // Resetting the cluster description input field after successfully adding a new cluster

    showToast('Concept cluster added.', 'success');
  }

  // The JSX structure of the settings page, including sections for cluster management, account settings, connected hub information, product key, and preferences. 
  // Each section contains placeholder content and forms for user interaction, with styling applied for a cohesive design.
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Manage account, hub, clusters, product key, and app preferences.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Cluster Management</h2>
          <p className="mt-2 text-sm text-slate-400">
            Prototype feature: a cluster represents one hub with up to 4 plants,
            watering control, and lamp control.
          </p>

          <div className="mt-5 space-y-3">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{cluster.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {cluster.description}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    {cluster.status}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Sensor module ID: {cluster.sensorModuleId} · Max plants: 4
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Add Cluster</h2>
          <p className="mt-2 text-sm text-slate-400">
            Concept-only form. This updates frontend state, not the backend.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleAddCluster}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-100">
                Cluster name
              </label>
              <input
                type="text"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                placeholder="e.g. Bedroom Cluster"
                className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-100">
                Description
              </label>
              <textarea
                value={clusterDescription}
                onChange={(e) => setClusterDescription(e.target.value)}
                placeholder="Describe where this cluster would be used"
                rows="4"
                className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Add concept cluster
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for email, password update, and profile settings.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Connected Hub</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for hub status, serial number, and firmware details.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Product Key</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for product key visibility and re-verification tools.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Preferences</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for notifications, themes, and plant care reminders.
          </p>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;