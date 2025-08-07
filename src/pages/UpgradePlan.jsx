import RazorpayButton from '../components/RazorpayButton';

const UpgradePlan = () => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">
          <div className="badge badge-primary badge-lg mb-4">Go Premium</div>
          <h2 className="card-title text-3xl font-bold">Upgrade Your Plan</h2>
          <p className="text-base-content/70 mt-2 mb-6">
            Unlock all features, get exclusive content, and enjoy an ad-free experience with a simple one-time payment.
          </p>

          <div className="w-full">
            {/* The amount is in paise (e.g., 19900 = ₹199.00) */}
            <RazorpayButton amount={19900} planName="Premium" />
          </div>

          <p className="text-xs text-base-content/50 mt-4">
            You will be redirected to Razorpay for a secure payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;