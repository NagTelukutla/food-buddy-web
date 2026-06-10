import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import GlassSelect from '../common/GlassSelect';
import ModalShell from '../common/ModalShell';
import Toggle from '../common/Toggle';
import { ROLES, normalizeRole } from '../../utils/roles';

const STAFF_TYPE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.DRIVER, label: 'Driver' },
];

export default function PlatformUserFormModal({
  open,
  editing,
  restaurants,
  defaultRole,
  showStaffTypeSelector = false,
  onClose,
  onSubmit,
  submitting,
}) {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { role: defaultRole, is_active: true },
  });

  const selectedRole = normalizeRole(watch('role'));
  const selectedRestaurantId = watch('restaurant_id');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        full_name: editing.full_name,
        email: editing.email,
        role: normalizeRole(editing.role),
        phone: editing.phone || '',
        restaurant_id: editing.restaurant_id || '',
        branch_id: editing.branch_id || '',
        is_active: editing.is_active,
      });
    } else {
      reset({ role: defaultRole, is_active: true });
    }
  }, [open, editing, defaultRole, reset]);

  if (!open) return null;

  const modalTitle = editing
    ? 'Edit user'
    : showStaffTypeSelector
      ? 'Onboard staff'
      : 'Add customer';

  return (
    <ModalShell title={modalTitle} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
        {showStaffTypeSelector && (
          <div className="sm:col-span-2">
            <label htmlFor="staff-user-type" className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
              User type *
            </label>
            <GlassSelect
              id="staff-user-type"
              value={selectedRole}
              options={STAFF_TYPE_OPTIONS}
              {...register('role', { required: true })}
            />
          </div>
        )}
        {!showStaffTypeSelector && <input type="hidden" {...register('role')} value={ROLES.CUSTOMER} />}
        {!editing && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
                Username *
              </label>
              <input
                className="input-field"
                placeholder="e.g. admin3"
                autoComplete="username"
                {...register('username', {
                  required: true,
                  minLength: 3,
                  setValueAs: (v) => v?.trim().toLowerCase().replace(/\s+/g, ''),
                  pattern: {
                    value: /^[a-z0-9][a-z0-9_.-]{2,49}$/,
                    message: 'Lowercase letters, numbers, dots, dashes, or underscores only',
                  },
                })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
                Password *
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Min 6 characters"
                autoComplete="new-password"
                {...register('password', { required: true, minLength: 6 })}
              />
            </div>
          </>
        )}
        <input className="input-field" placeholder="Full name *" {...register('full_name', { required: true })} />
        <input className="input-field" placeholder="Email *" type="email" {...register('email', { required: true })} />
        <input className="input-field" placeholder="Mobile number" {...register('phone')} />
        {selectedRole === ROLES.ADMIN && (
          <p className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Assign admins to restaurants from the Settings icon on the Restaurants screen.
          </p>
        )}
        {selectedRole === ROLES.DRIVER && (
          <div className="sm:col-span-2">
            <label htmlFor="driver-restaurant" className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
              Restaurant *
            </label>
            <GlassSelect
              id="driver-restaurant"
              value={selectedRestaurantId ?? ''}
              placeholder="Select restaurant"
              options={[
                { value: '', label: 'Select restaurant' },
                ...restaurants.map((r) => ({ value: r.id, label: r.name })),
              ]}
              {...register('restaurant_id', { required: selectedRole === ROLES.DRIVER })}
            />
          </div>
        )}
        {editing && (
          <input
            type="password"
            className="input-field sm:col-span-2"
            placeholder="New password (optional)"
            {...register('password')}
          />
        )}
        {editing && (
          <div className="flex items-center sm:col-span-2">
            <Toggle
              label="Account active"
              checked={!!watch('is_active')}
              onChange={(v) => setValue('is_active', v)}
            />
          </div>
        )}
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : editing ? 'Update' : showStaffTypeSelector ? 'Onboard' : 'Create'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
