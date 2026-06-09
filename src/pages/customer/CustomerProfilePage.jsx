import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { customerApi } from '../../api/restaurantApi';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/common/PageContainer';
import { formatDate } from '../../utils/format';
import { isValidPhone } from '../../utils/phone';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const loadProfile = () => {
    setLoading(true);
    customerApi
      .profile()
      .then(({ data }) => {
        setProfile(data);
        reset({
          name: data.name,
          email: data.email || '',
          phone: data.phone,
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { data: updated } = await customerApi.updateProfile({
        name: data.name,
        email: data.email || null,
        phone: data.phone,
      });
      setProfile(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }
  if (!profile) return null;

  return (
    <PageContainer>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My Profile</h1>
        <p className="mt-1 text-sm text-stone-500">Manage your personal information</p>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="relative bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 text-white">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white/25 hover:ring-white/40"
              aria-label="Edit profile"
              title="Edit profile"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold ring-2 ring-white/30">
              {getInitials(profile.name)}
            </span>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-sm text-brand-100">{profile.email || 'No email added'}</p>
              <p className="mt-1 text-xs text-brand-200">Member since {formatDate(profile.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input
                  className="input-field"
                  {...register('name', { required: 'Name is required', minLength: 2 })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="input-field"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  className="input-field"
                  {...register('phone', {
                    required: 'Phone is required',
                    validate: (v) => isValidPhone(v) || 'Enter a valid phone number',
                  })}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    reset({
                      name: profile.name,
                      email: profile.email || '',
                      phone: profile.phone,
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Full Name</dt>
                <dd className="mt-1 font-medium text-stone-800">{profile.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Email</dt>
                <dd className="mt-1 font-medium text-stone-800">{profile.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Phone</dt>
                <dd className="mt-1 font-medium text-stone-800">{profile.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Loyalty Points</dt>
                <dd className="mt-1 font-medium text-brand-700">{profile.loyalty_points_balance} pts</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Saved Addresses</dt>
                <dd className="mt-1 text-stone-800">
                  {profile.addresses?.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.addresses.map((addr) => (
                        <li key={addr.label} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
                          <span className="font-medium">{addr.label}</span>
                          {addr.is_default && (
                            <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700">Default</span>
                          )}
                          <p className="text-stone-600">
                            {addr.line1}, {addr.city} — {addr.pincode}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      inline
                      icon="address"
                      title="No saved addresses yet"
                      message="Your delivery addresses will appear here after you save them at checkout."
                    />
                  )}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
    </PageContainer>
  );
}
