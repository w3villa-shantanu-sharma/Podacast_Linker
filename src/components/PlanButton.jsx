// src/components/PlanButton.jsx

export default function PlanButton({ onUpgrade, loading }) {
  return (
    <button
      className="btn btn-primary w-full"
      onClick={onUpgrade}
      disabled={loading}
    >
      {loading && <span className="loading loading-spinner"></span>}
      Upgrade to Premium
    </button>
  );
}