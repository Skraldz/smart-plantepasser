
// A reusable input component that accepts label, type, value, onChange handler, placeholder, disabled state, and name as props.
export default function Input({
  label,
  type = 'text',
  value,
  onChange, //function to handle input changes, passed as a prop
  placeholder = '',
  disabled = false,
  name,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </div>
  );
}