// A reusable button component that accepts children, type, onClick handler, disabled state, and additional class names as props. 
export default function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  className = '', // Allow additional class names to be passed as a prop
}) {
  return (
    <button
      type={type} // Set the button type (e.g., "button", "submit", "reset")
      onClick={onClick} // Attach the onClick handler passed as a prop
      disabled={disabled} // Disable the button if the disabled prop is true
      className={`w-full rounded-xl bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} // Apply default and additional class names
    >
      {children} // Render the content passed as children inside the button
    </button>
  );
}