import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Toggle from '../common/Toggle';
import { CATEGORIES } from '../../utils/constants';

export default function MenuFormModal({ item, onClose, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image: 'default.jpg',
      category: 'Starters',
      available: true,
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        available: item.available,
      });
    }
  }, [item, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none sm:rounded-xl">
        <h2 className="mb-4 text-lg font-bold">{item ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Name</label>
            <input className="input-field" {...register('name', { required: 'Name is required', minLength: 2 })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Description</label>
            <textarea className="input-field" rows={3} {...register('description', { required: 'Description required' })} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Price (₹)</label>
              <input type="number" step="0.01" className="input-field" {...register('price', { required: true, min: 1 })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <select className="input-field" {...register('category', { required: true })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Image filename</label>
            <input className="input-field" {...register('image')} />
          </div>
          <Controller
            name="available"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Available"
                description={field.value ? 'On — item visible on menu' : 'Off — item hidden from customers'}
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
