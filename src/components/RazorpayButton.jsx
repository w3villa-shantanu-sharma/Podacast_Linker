// components/RazorpayButton.jsx
import { loadRazorpay } from '../utils/loadRazorpay';
import { createOrder, verifyPayment } from '../services/payment';
import { toast } from 'react-toastify';

const RazorpayButton = ({ amount, planName }) => {
  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      toast.error('Razorpay SDK failed to load.');
      return;
    }

    try {
      const { data } = await createOrder(amount); // backend returns order_id

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your actual key
        amount: data.amount,
        currency: 'INR',
        name: 'PodcastLinkHub',
        description: `Subscribe to ${planName}`,
        order_id: data.id,
        handler: async function (response) {
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.data.success) {
            toast.success('Payment successful and verified!');
          } else {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#2D3748',
        },
      };

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();
    } catch (err) {
      toast.error('Payment initiation failed.');
      console.error(err);
    }
  };

  return (
    <button onClick={handlePayment} className="bg-blue-600 px-4 py-2 text-white rounded">
      Buy {planName}
    </button>
  );
};

export default RazorpayButton;
