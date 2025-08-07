import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/base";

// --- Helper Icon Components ---
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);
const IconCrown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);

// --- Plan Configuration ---
const PLANS = [
  { 
    id: "FREE", 
    name: "Free", 
    price: 0, 
    duration: "Forever", 
    features: ["Basic podcast streaming", "Limited episode access", "Standard audio quality"], 
    youtubeLinks: 0,
    popular: false, 
    description: "Get started with the basics", 
    buttonStyle: "btn-outline" 
  },
  { 
    id: "SILVER", 
    name: "Silver", 
    price: 50, 
    duration: "1 Hour", 
    features: ["Everything in Free", "No ads on episodes", "HD audio quality", "5 YouTube podcast links"], 
    youtubeLinks: 5,
    popular: false, 
    description: "A serious upgrade for listeners", 
    buttonStyle: "btn-secondary" 
  },
  { 
    id: "GOLD", 
    name: "Gold", 
    price: 100, 
    duration: "6 Hours", 
    features: ["Everything in Silver", "Unlimited offline downloads", "50 YouTube podcast links", "Priority access"], 
    youtubeLinks: 50,
    popular: true, 
    description: "Best value for enthusiasts", 
    buttonStyle: "btn-primary" 
  },
  { 
    id: "PREMIUM", 
    name: "Premium", 
    price: 150, 
    duration: "12 Hours", 
    features: ["Everything in Gold", "100 YouTube podcast links", "Studio quality audio", "VIP support"], 
    youtubeLinks: 100,
    popular: false, 
    description: "The ultimate experience", 
    buttonStyle: "btn-accent" 
  },
];

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle plan selection to open the confirmation modal
  const handleSelectPlan = (plan) => {
    if (plan.id === "FREE") {
      // Handle free plan (can add a toast/alert here if needed)
      return;
    }
    setSelectedPlan(plan);
    // Use DaisyUI method to open a modal
    const modal = document.getElementById('payment_confirm_modal');
    if (modal) {
      modal.showModal();
    }
  };

  // Process payment through Razorpay
  const handleProceedPayment = async () => {
    if (!selectedPlan || selectedPlan.id === "FREE") return;
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post("/payment/create-order", { plan: selectedPlan.id });
      const { order } = response.data;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Podcast Hub Subscription",
        description: `${selectedPlan.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan.id,
            });
            navigate("/dashboard", { state: { message: `Payment Successful! Your ${selectedPlan.name} plan is now active.` } });
          } catch (err) {
            console.error("Payment verification error:", err);
            setError("Payment verification failed. Please contact support if your payment was deducted.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#3b82f6", // Blue color for Razorpay modal
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error("Payment initialization error:", error);
      const errorMessage = error.response?.data?.message || "Could not initiate payment. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      const modal = document.getElementById('payment_confirm_modal');
      if (modal) {
        modal.close();
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* --- Header --- */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="badge badge-primary badge-lg mb-4">Pricing Plans</div>
        <h1 className="text-4xl md:text-5xl font-bold">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg text-base-content/70 mt-4">
          Unlock premium features to enhance your podcast experience with our flexible options.
        </p>
      </div>

      {/* --- Plans Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`card bg-base-100 shadow-xl border-2 ${plan.popular ? 'border-primary' : 'border-base-300'}`}
          >
            {plan.popular && (
              <div className="badge badge-primary absolute -top-3 -right-3">Most Popular</div>
            )}
            <div className="card-body items-center text-center p-6">
              <div className={`rounded-full p-4 bg-${plan.buttonStyle.replace('btn-','')}/10 text-${plan.buttonStyle.replace('btn-','')}`}>
                {plan.id === "PREMIUM" ? <IconCrown /> : <IconCheck />}
              </div>
              <h2 className="card-title text-2xl">{plan.name}</h2>
              <p className="text-base-content/70">{plan.description}</p>
              
              <div className="my-4">
                <span className="text-4xl font-extrabold">₹{plan.price}</span>
                <span className="text-base-content/60">/ {plan.duration}</span>
              </div>
              
              <ul className="space-y-2 text-left mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="inline-block p-1 rounded-full bg-green-500/20 text-green-500"><IconCheck /></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="card-actions w-full mt-auto">
                <button
                  className={`btn ${plan.buttonStyle} w-full`}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={user?.plan === plan.id}
                >
                  {user?.plan === plan.id ? "Current Plan" : "Select Plan"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Payment Confirmation Modal --- */}
      <dialog id="payment_confirm_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm {selectedPlan?.name} Plan</h3>
          <p className="py-4">You're about to purchase the {selectedPlan?.name} plan for ₹{selectedPlan?.price}.</p>
          
          <ul className="space-y-2 text-sm mb-6">
            {selectedPlan?.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="inline-block p-1 rounded-full bg-green-500/20 text-green-500"><IconCheck /></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {error && <div role="alert" className="alert alert-error text-sm mb-4"><span>{error}</span></div>}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">Cancel</button>
            </form>
            <button
              className={`btn ${selectedPlan?.buttonStyle}`}
              onClick={handleProceedPayment}
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner"></span>}
              Proceed to Payment
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}