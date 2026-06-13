import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentApi } from '../api/paymentApi';
import GlassSelect from '../components/common/GlassSelect';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModalShell from '../components/common/ModalShell';
import PageContainer from '../components/common/PageContainer';
import PageTitle from '../components/common/PageTitle';
import CartSummary from '../components/cart/CartSummary';
import { useCart } from '../context/CartContext';
import { useDeliveryLocation } from '../context/DeliveryLocationContext';
import { openRazorpayCheckout } from '../services/razorpayCheckout';
import { ORDER_TYPES } from '../utils/constants';
import { isValidPhone } from '../utils/phone';
import { customerApi } from '../api/restaurantApi';
import { useAuth } from '../context/AuthContext';
import StaffOrderingBlocked from '../components/order/StaffOrderingBlocked';
import { canPlaceOrders, getStaffSessions, hasCustomerSession } from '../utils/roles';
import { useSelectedRestaurant } from '../context/SelectedRestaurantContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { activeSessions } = useAuth();
  const { deliveryLocation } = useDeliveryLocation();
  const { selectedRestaurant } = useSelectedRestaurant();
  const customerSignedIn = hasCustomerSession(activeSessions);
  const orderingAllowed = canPlaceOrders(activeSessions);
  const staffSessions = getStaffSessions(activeSessions);
  const [submitting, setSubmitting] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { order_type: 'Delivery' },
  });

  const orderType = watch('order_type');

  useEffect(() => {
    paymentApi
      .getConfig()
      .then(({ data }) => setPaymentReady(data.enabled))
      .catch(() => setPaymentReady(false));
  }, []);

  useEffect(() => {
    if (!customerSignedIn) return;
    customerApi
      .profile()
      .then(({ data }) => {
        reset({
          order_type: 'Delivery',
          customer_name: data.name,
          phone: data.phone,
        });
      })
      .catch(() => {});
  }, [customerSignedIn, reset]);

  useEffect(() => {
    if (orderType === 'Delivery' && deliveryLocation?.address) {
      setValue('delivery_address', deliveryLocation.address, { shouldValidate: true });
    }
  }, [deliveryLocation, orderType, setValue]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const buildOrderPayload = (data) => ({
    customer_name: data.customer_name,
    phone: data.phone,
    table_number: data.table_number || null,
    order_type: data.order_type,
    delivery_address: data.delivery_address?.trim() || null,
    delivery_lat: data.order_type === 'Delivery' ? deliveryLocation?.latitude : null,
    delivery_lng: data.order_type === 'Delivery' ? deliveryLocation?.longitude : null,
    restaurant_id: items[0]?.restaurant_id || selectedRestaurant?.id || 1,
    notes: data.notes || null,
    items: items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
  });

  const onSubmit = async (data) => {
    if (!orderingAllowed) {
      toast.error('Admin accounts cannot place orders. Use a customer account.');
      return;
    }
    if (!paymentReady) {
      toast.error('Online payment is not configured. Contact the restaurant.');
      return;
    }

    setSubmitting(true);
    let restaurantOrderId = null;

    try {
      const orderPayload = buildOrderPayload(data);
      const { data: checkout } = await paymentApi.checkout(orderPayload);
      restaurantOrderId = checkout.order.order_id;

      const razorpayResponse = await openRazorpayCheckout(checkout.razorpay);

      const { data: verified } = await paymentApi.verify({
        restaurant_order_id: checkout.order.order_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      });

      clearCart();
      navigate('/order-success', {
        state: { order: verified.order, payment: verified.payment },
      });
    } catch (err) {
      if (restaurantOrderId) {
        try {
          await paymentApi.markFailed({
            restaurant_order_id: restaurantOrderId,
            reason: err.code === 'CANCELLED' ? 'payment_cancelled' : 'payment_failed',
          });
        } catch {
          /* ignore secondary errors */
        }
      }

      if (err.code === 'CANCELLED') {
        toast.error('Payment cancelled');
        navigate('/payment-cancelled', { state: { orderId: restaurantOrderId } });
      } else {
        const detail = err.response?.data?.detail;
        toast.error(
          typeof detail === 'string' ? detail : err.message || 'Payment failed'
        );
        navigate('/payment-failed', { state: { orderId: restaurantOrderId } });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <button
          type="button"
          onClick={() => setShowLeaveConfirm(true)}
          className="glass-icon-btn shrink-0"
          aria-label="Back to cart"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <PageTitle className="mb-0">Checkout</PageTitle>
      </div>

      {showLeaveConfirm && (
        <ModalShell
          title="Leave checkout?"
          onClose={() => setShowLeaveConfirm(false)}
          compact
          centered
          confirmCentered
        >
          <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
            <p className="text-sm text-stone-600">
              Your cart items will be saved. Are you sure you want to go back to the cart?
            </p>
          </div>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() => setShowLeaveConfirm(false)}
            >
              Stay
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => navigate('/cart')}
            >
              Go to Cart
            </button>
          </div>
        </ModalShell>
      )}

      {customerSignedIn && !orderingAllowed && (
        <div className="mb-6">
          <StaffOrderingBlocked staffSessions={staffSessions} />
        </div>
      )}

      {!paymentReady && (
        <div className="card mb-6 border-amber-200 bg-amber-50 text-sm text-amber-900">
          Payment gateway is not configured on the server. Add Razorpay keys to backend{' '}
          <code className="rounded bg-amber-100 px-1">.env</code> to enable UPI and online payments.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="order-1 lg:order-2">
          <CartSummary items={items} subtotal={subtotal} tax={tax} total={total} showCheckout={false} />
          <div className="card mt-4 text-sm text-stone-600">
            <p className="font-semibold text-stone-800">Secure payment</p>
            <p className="mt-1">
              Pay via UPI, cards, netbanking, or wallets powered by Razorpay.
            </p>
            <p className="mt-2 text-xs text-stone-500">
              If UPI is unavailable, use Card. UPI must be enabled on your Razorpay account
              (Dashboard → Account &amp; Settings → Payment Methods).
            </p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card order-2 space-y-4 lg:order-1 lg:col-span-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Customer Name *</label>
            <input
              className="input-field"
              {...register('customer_name', { required: 'Name is required', minLength: 2 })}
            />
            {errors.customer_name && (
              <p className="mt-1 text-xs text-red-600">{errors.customer_name.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number *</label>
            <input
              className={`input-field ${customerSignedIn ? 'bg-stone-100 text-stone-700' : ''}`}
              readOnly={customerSignedIn}
              {...register('phone', {
                required: 'Phone is required',
                validate: (v) => isValidPhone(v) || 'Enter a valid 10–15 digit phone number',
              })}
            />
            {customerSignedIn && (
              <p className="mt-1 text-xs text-stone-500">
                Orders are linked to your profile mobile and appear in My Orders.
              </p>
            )}
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Order Type *</label>
            <GlassSelect
              value={orderType}
              options={ORDER_TYPES.map((t) => ({ value: t, label: t }))}
              {...register('order_type', { required: true })}
            />
          </div>
          {orderType === 'Delivery' && (
            <div>
              <label className="mb-1 block text-sm font-medium">Delivery Address *</label>
              <textarea
                className="input-field min-h-[7rem] resize-y"
                rows={4}
                placeholder="Street, city, pincode"
                {...register('delivery_address', { required: orderType === 'Delivery' ? 'Address required' : false })}
              />
              {errors.delivery_address && (
                <p className="mt-1 text-xs text-red-600">{errors.delivery_address.message}</p>
              )}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea className="input-field" rows={3} {...register('notes')} />
          </div>
          <button
            type="submit"
            disabled={submitting || !paymentReady || !orderingAllowed}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                Processing payment...
              </>
            ) : (
              `Pay ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total)}`
            )}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
