const loadScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });

/**
 * Opens Razorpay checkout or resolves mock payment in development.
 * @returns {Promise<{ razorpay_order_id, razorpay_payment_id, razorpay_signature }>}
 */
export const openRazorpayCheckout = async ({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  name = 'FitSphere Pro',
  description,
  email,
  mock = false,
}) => {
  if (mock || !keyId) {
    return {
      razorpay_order_id: orderId,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: 'mock',
    };
  }

  await loadScript();

  return new Promise((resolve, reject) => {
    let completed = false;

    const options = {
      key: keyId,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill: { email },
      theme: { color: '#c3f400' },
      handler: (response) => {
        completed = true;
        resolve({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          if (!completed) {
            reject(new Error('Payment cancelled'));
          }
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (err) => {
      if (!completed) {
        reject(new Error(err.error?.description || 'Payment failed'));
      }
    });
    rzp.open();
  });
};
