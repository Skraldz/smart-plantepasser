function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const styles = {
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    info: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
    warning: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300',
    error: 'border-red-400/30 bg-red-500/10 text-red-300',
  };
// The Toast component is a reusable UI component that displays a temporary message to the user
  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md ${styles[type]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium">{message}</p>

        <button
          onClick={onClose}
          className="text-xs font-semibold uppercase tracking-wide opacity-80 transition hover:opacity-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
export default Toast;