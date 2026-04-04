import './Button.css';

export default function Button({ title, onClick, loading, variant = 'primary', type = 'button' }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <span className="btn-spinner" /> : title}
    </button>
  );
}
