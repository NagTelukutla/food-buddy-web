import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deliveryApi } from '../../api/restaurantApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/common/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../utils/roles';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function ReportStat({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-stone-50 text-stone-900 ring-stone-200',
    success: 'bg-green-50 text-green-800 ring-green-200',
    danger: 'bg-red-50 text-red-800 ring-red-200',
  };

  return (
    <div className={`rounded-xl p-4 ring-1 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function DeliveryProfilePage() {
  const { user, role } = useAuth();
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);

  useEffect(() => {
    deliveryApi
      .report()
      .then(({ data }) => setReport(data))
      .catch(() => toast.error('Failed to load delivery report'))
      .finally(() => setLoadingReport(false));
  }, []);

  if (!user) return null;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Delivery</p>
          <h1 className="text-2xl font-bold text-stone-900">My Profile</h1>
          <p className="mt-1 text-sm text-stone-500">Profile details and your delivery performance</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card overflow-hidden p-0">

            <div className="relative bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold ring-2 ring-white/30">
                  {getInitials(user.full_name)}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{user.full_name}</h3>
                  <p className="text-sm text-brand-100">{user.email || 'No email added'}</p>
                  <p className="mt-1 text-xs text-brand-200">{getRoleLabel(role)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Full Name</dt>
                  <dd className="mt-1 font-medium text-stone-800">{user.full_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Username</dt>
                  <dd className="mt-1 font-medium text-stone-800">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Email</dt>
                  <dd className="mt-1 font-medium text-stone-800">{user.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Phone</dt>
                  <dd className="mt-1 font-medium text-stone-800">{user.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Role</dt>
                  <dd className="mt-1 font-medium text-brand-700">{getRoleLabel(role)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="border-b border-stone-100 bg-stone-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-stone-900">Complete Delivery Report</h2>
              <p className="mt-1 text-sm text-stone-500">All deliveries assigned to you</p>
            </div>

            <div className="p-6">
              {loadingReport ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <ReportStat label="Total" value={report?.total ?? 0} />
                    <ReportStat label="Completed" value={report?.completed ?? 0} tone="success" />
                    <ReportStat label="Failed" value={report?.failed ?? 0} tone="danger" />
                  </div>
                  <p className="mt-4 text-xs text-stone-500">
                    Completed deliveries are marked delivered. Failed deliveries are assigned orders that were
                    cancelled before completion.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
