const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise = null;

export function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser'));
  }
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Opens Razorpay Checkout (UPI, cards, netbanking, wallets).
 * @returns {Promise<object>} Resolves with razorpay payment response on success.
 */
export function openRazorpayCheckout(checkoutData) {
  return loadRazorpayScript().then(
    (Razorpay) =>
      new Promise((resolve, reject) => {
        const options = {
          key: checkoutData.key_id,
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          name: checkoutData.company_name,
          description: checkoutData.description,
          order_id: checkoutData.razorpay_order_id,
          prefill: {
            name: checkoutData.customer_name,
            contact: checkoutData.customer_phone,
          },
          theme: { color: '#ea580c' },
          // Do not set top-level `method: { upi: true }` — that forces UPI and shows
          // "UPI Mode is Not Enabled" when UPI is not activated on the Razorpay account.
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'Pay via UPI',
                  instruments: [{ method: 'upi' }],
                },
              },
              sequence: ['block.upi', 'card', 'netbanking', 'wallet'],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          handler(response) {
            resolve(response);
          },
          modal: {
            ondismiss() {
              reject(Object.assign(new Error('Payment cancelled'), { code: 'CANCELLED' }));
            },
            escape: true,
            confirm_close: true,
          },
        };

        if (checkoutData.checkout_config_id) {
          options.checkout_config_id = checkoutData.checkout_config_id;
        }

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response) => {
          reject(
            Object.assign(new Error('Payment failed'), {
              code: 'FAILED',
              razorpayResponse: response,
            })
          );
        });
        rzp.open();
      })
  );
}
