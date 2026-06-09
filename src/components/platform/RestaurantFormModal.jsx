import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ModalShell from '../common/ModalShell';
import Toggle from '../common/Toggle';

export default function RestaurantFormModal({
  open,
  editing,
  onClose,
  onSubmit,
  submitting,
}) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        restaurant_name: editing.name,
        email: editing.email,
        phone: editing.phone,
        address: editing.address || '',
        tagline: editing.tagline || '',
        cuisine_type: editing.cuisine_type || '',
        working_hours: editing.working_hours || '',
        is_active: editing.is_active,
      });
    } else {
      reset({ is_active: true });
    }
  }, [open, editing, reset]);

  if (!open) return null;

  return (
    <ModalShell
      title={editing ? 'Edit restaurant' : 'Onboard restaurant'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
        <input
          className="input-field"
          placeholder="Restaurant name *"
          {...register('restaurant_name', { required: true })}
        />
        <input className="input-field" placeholder="Cuisine type" {...register('cuisine_type')} />
        <input className="input-field" placeholder="Email *" type="email" {...register('email', { required: true })} />
        <input className="input-field" placeholder="Phone *" {...register('phone', { required: true })} />
        <input
          className="input-field sm:col-span-2"
          placeholder="Address *"
          {...register('address', { required: true })}
        />
        <input className="input-field" placeholder="Tagline" {...register('tagline')} />
        <input className="input-field" placeholder="Working hours" {...register('working_hours')} />

        {!editing && (
          <>
            <h3 className="sm:col-span-2 mt-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Owner account
            </h3>
            <input
              className="input-field"
              placeholder="Owner full name *"
              {...register('owner_full_name', { required: true })}
            />
            <input
              className="input-field"
              placeholder="Owner username *"
              {...register('owner_username', { required: true })}
            />
            <input
              className="input-field"
              placeholder="Owner email *"
              type="email"
              {...register('owner_email', { required: true })}
            />
            <input className="input-field" placeholder="Owner phone" {...register('owner_phone')} />
            <input
              type="password"
              className="input-field sm:col-span-2"
              placeholder="Owner password * (min 6 chars)"
              {...register('owner_password', { required: true, minLength: 6 })}
            />
            {errors.owner_password && (
              <p className="text-xs text-red-600 sm:col-span-2">Password required (min 6)</p>
            )}
          </>
        )}

        {editing && (
          <div className="flex items-center sm:col-span-2">
            <Toggle
              label="Restaurant active"
              checked={!!watch('is_active')}
              onChange={(v) => setValue('is_active', v)}
            />
          </div>
        )}

        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : editing ? 'Update restaurant' : 'Create restaurant & owner'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
