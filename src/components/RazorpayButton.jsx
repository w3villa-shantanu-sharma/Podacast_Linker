// // components/RazorpayButton.jsx
// import { loadRazorpay } from '../utils/loadRazorpay';
// import { createOrder, verifyPayment } from '../services/payment';
// import { toast } from 'react-toastify';

// const RazorpayButton = ({ amount, planName }) => {
//   const handlePayment = async () => {
//     const res = await loadRazorpay();
//     if (!res) {
//       toast.error('Razorpay SDK failed to load.');
//       return;
//     }

//     try {
//       const { data } = await createOrder(amount); // backend returns order_id

//       const options = {
//         key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your actual key
//         amount: data.amount,
//         currency: 'INR',
//         name: 'PodcastLinkHub',
//         description: `Subscribe to ${planName}`,
//         order_id: data.id,
//         handler: async function (response) {
//           const verifyRes = await verifyPayment({
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//           });

//           if (verifyRes.data.success) {
//             toast.success('Payment successful and verified!');
//           } else {
//             toast.error('Payment verification failed.');
//           }
//         },
//         prefill: {
//           name: 'Test User',
//           email: 'test@example.com',
//           contact: '9999999999',
//         },
//         theme: {
//           color: '#2D3748',
//         },
//       };

//       const razorpayObject = new window.Razorpay(options);
//       razorpayObject.open();
//     } catch (err) {
//       toast.error('Payment initiation failed.');
//       console.error(err);
//     }
//   };

//   return (
//     <button onClick={handlePayment} className="bg-blue-600 px-4 py-2 text-white rounded">
//       Buy {planName}
//     </button>
//   );
// };

// export default RazorpayButton;


// src/components/RazorpayButton.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // To get user details
import { toast } from 'react-toastify';

// --- Helper function to dynamically load the Razorpay script ---
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      resolve(false);
      console.error("Razorpay SDK failed to load.");
    };
    document.body.appendChild(script);
  });
};

const RazorpayButton = ({ amount, planName, planId, onPaymentSuccess }) => {
  const { user } = useAuth(); // Get authenticated user's details
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      toast.error('Payment gateway could not be loaded. Please check your connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create an order from your backend
      // Replace with your actual API service call
      const orderResponse = await api.post('/payment/create-order', {
        amount: amount, // Amount in paise
        planId: planId,
      });

      const { order } = orderResponse.data;

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variables
        amount: order.amount,
        currency: order.currency,
        name: 'PodcastLinkHub',
        description: `Upgrade to ${planName} Plan`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify the payment on your backend
          try {
            // Replace with your actual API service call
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });

            toast.success('Payment successful and verified!');
            
            // Call the callback function on success
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }

          } catch (verifyError) {
            toast.error('Payment verification failed. If money was deducted, please contact support.');
          }
        },
        prefill: {
          name: user?.name || 'User',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#3b82f6', // A modern blue color
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment was not completed.');
            setLoading(false); // Re-enable the button if the modal is dismissed
          }
        }
      };

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="btn btn-primary w-full"
      disabled={loading}
    >
      {loading && <span className="loading loading-spinner"></span>}
      Buy {planName}
    </button>
  );
};

export default RazorpayButton;