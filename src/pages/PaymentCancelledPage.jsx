import { Link, useLocation } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';

export default function PaymentCancelledPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <PageContainer className="text-center">
      <div className="mb-6 text-5xl">⚠️</div>
      <h1 className="mb-2 text-2xl font-bold text-amber-700">Payment Cancelled</h1>
      <p className="mb-6 text-stone-600">
        You closed the payment window before completing checkout. Your cart items are still saved.
      </p>
      {orderId && (
        <p className="mb-6 font-mono text-sm text-stone-500">Reference: {orderId}</p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/checkout" className="btn-primary py-3">
          Try Again
        </Link>
        <Link to="/cart" className="btn-secondary py-3">
          View Cart
        </Link>
      </div>
    </PageContainer>
  );
}
