import StatusBadge from '../common/StatusBadge';
import { getTrackerSteps, normalizeOrderStatus } from '../../utils/orderWorkflow';

function StepCheckIcon() {
  return (
    <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function OrderTracker({ status, orderType = 'Delivery' }) {
  const normalized = normalizeOrderStatus(status);
  const steps = getTrackerSteps(orderType);
  const currentIndex = steps.indexOf(normalized);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-stone-600">Current Status</span>
        <StatusBadge status={normalized} />
      </div>

      <ol className="order-tracker">
        {steps.map((step, index) => {
          const isReached = currentIndex >= index && currentIndex !== -1;
          const isCurrent = normalized === step;
          const isLast = index === steps.length - 1;
          const lineActive = currentIndex > index && currentIndex !== -1;

          let dotClass = 'order-tracker__dot order-tracker__dot--pending';
          if (isCurrent) dotClass = 'order-tracker__dot order-tracker__dot--current';
          else if (isReached) dotClass = 'order-tracker__dot order-tracker__dot--done';

          let labelClass = 'order-tracker__label';
          if (isCurrent) labelClass += ' order-tracker__label--current';
          else if (isReached) labelClass += ' order-tracker__label--done';

          return (
            <li key={step} className="order-tracker__item">
              <div className="order-tracker__rail" aria-hidden="true">
                <span className={dotClass}>
                  {isReached ? <StepCheckIcon /> : <span>{index + 1}</span>}
                </span>
                {!isLast && (
                  <span
                    className={`order-tracker__line${lineActive ? ' order-tracker__line--active' : ''}`}
                  />
                )}
              </div>
              <div className={labelClass}>
                <span className="order-tracker__title">{step}</span>
                {isCurrent && <span className="order-tracker__badge">Current</span>}
              </div>
            </li>
          );
        })}
      </ol>

      {status === 'Cancelled' && (
        <p className="glass-surface-soft rounded-2xl p-3 text-sm text-red-700">
          This order has been cancelled.
        </p>
      )}
    </div>
  );
}
