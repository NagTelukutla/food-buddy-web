import StatusBadge from '../common/StatusBadge';
import { getTrackerSteps, normalizeOrderStatus } from '../../utils/orderWorkflow';

export default function OrderTracker({ status, orderType = 'Delivery' }) {
  const normalized = normalizeOrderStatus(status);
  const steps = getTrackerSteps(orderType);
  const currentIndex = steps.indexOf(normalized);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-600">Current Status</span>
        <StatusBadge status={normalized} />
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 h-full w-0.5 bg-stone-200" />
        <ul className="space-y-6">
          {steps.map((step, index) => {
            const isComplete = currentIndex >= index && currentIndex !== -1;
            const isCurrent = normalized === step;
            return (
              <li key={step} className="relative flex items-center gap-4 pl-10">
                <span
                  className={`absolute left-2 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    isComplete
                      ? 'bg-brand-600 text-white'
                      : 'border-2 border-stone-300 bg-white'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? 'text-brand-700' : isComplete ? 'text-stone-700' : 'text-stone-400'
                  }`}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {status === 'Cancelled' && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          This order has been cancelled.
        </p>
      )}
    </div>
  );
}
