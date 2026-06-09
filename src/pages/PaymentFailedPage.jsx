import { Link, useLocation } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';

export default function PaymentFailedPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <PageContainer className="text-center">
      <div className="mb-6 text-5xl">❌</div>
      <h1 className="mb-2 text-2xl font-bold text-red-700">Payment Failed</h1>
      <p className="mb-6 text-stone-600">
        Your payment could not be completed. No charges were applied, or the transaction was
        declined. You can try again from your cart.
      </p>
      {orderId && (
        <p className="mb-6 font-mono text-sm text-stone-500">Reference: {orderId}</p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/cart" className="btn-primary py-3">
          Back to Cart
        </Link>
        <Link to="/menu" className="btn-secondary py-3">
          Continue Shopping
        </Link>
      </div>
    </PageContainer>
  );
}
