// pages/UpgradePlan.jsx
import RazorpayButton from '../components/RazorpayButton';

const UpgradePlan = () => {
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
      <p className="mb-4">Unlock all podcast features with a one-time payment.</p>
      <RazorpayButton amount={19900} planName="Premium" /> {/* Amount is in paise */}
    </div>
  );
};

export default UpgradePlan;
// This code defines a simple upgrade plan page that allows users to upgrade to a premium plan using Razorpay.
// It imports a `RazorpayButton` component that handles the payment process.
// The `UpgradePlan` component renders a title, a description, and the `RazorpayButton` with a specified amount and plan name.
// The amount is set to 19900 paise, which is equivalent to ₹199.00.
// The page is styled with Tailwind CSS classes to create a clean and centered layout.
// The `RazorpayButton` component is responsible for initiating the payment process when clicked.
// It uses Razorpay's SDK to create an order and handle the payment verification.
// The `amount` prop is passed in paise (19900), and the `planName` prop is set to "Premium".
// This allows users to easily upgrade their plan and access premium features of the podcast application.
// The page is designed to be user-friendly and straightforward, focusing on the upgrade process.
// The `RazorpayButton` component is expected to handle the payment logic,
// including creating an order, opening the Razorpay payment modal, and verifying the payment on success.
// The `UpgradePlan` component is a functional React component that can be used in a larger application
// to provide users with an option to upgrade their plan.
// It is styled using Tailwind CSS for a modern and responsive design.