// A simple Card component that wraps its children and accepts an optional className prop for additional styling.

export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-md ${className}`}>
      {children}
    </div>
  );
}