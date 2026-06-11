import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { customerApi } from '../../api/restaurantApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/common/PageContainer';
import RoundedRadio from '../../components/common/RoundedRadio';
import { useDeliveryLocation } from '../../context/DeliveryLocationContext';

function addressKey(addr, index) {
  return `${addr.label}-${addr.line1}-${index}`;
}

const emptyAddressForm = {
  label: '',
  line1: '',
  city: '',
  pincode: '',
};

function AddressFormFields({ register, errors }) {
  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium">Label</label>
        <input
          className="input-field"
          placeholder="Home, Work, etc."
          {...register('label', { required: 'Label is required' })}
        />
        {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Address Line</label>
        <input
          className="input-field"
          placeholder="Street, building, apartment"
          {...register('line1', { required: 'Address is required' })}
        />
        {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <input
            className="input-field"
            placeholder="Enter city"
            {...register('city', { required: 'City is required' })}
          />
          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pincode</label>
          <input
            className="input-field"
            placeholder="Enter pincode"
            {...register('pincode', { required: 'Pincode is required', minLength: 4 })}
          />
          {errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode.message}</p>}
        </div>
      </div>
    </>
  );
}

function EmptyAddressForm({ onSubmit, register, errors, saving }) {
  return (
    <div className="glass-empty relative px-6 py-10 sm:py-12">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-200/35 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/30 blur-2xl" />

      <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/70">
        <span className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600 backdrop-blur-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
      </div>

      <h3 className="relative text-center text-lg font-semibold text-stone-800 sm:text-xl">
        No saved addresses yet
      </h3>
      <p className="relative mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-stone-500">
        Add your first delivery address below to use it at checkout.
      </p>

      <form onSubmit={onSubmit} className="relative mx-auto mt-8 max-w-lg space-y-4 text-left">
        <AddressFormFields register={register} errors={errors} />
        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}

export default function CustomerSavedAddressesPage() {
  const { selectSavedAddress } = useDeliveryLocation();
  const [addresses, setAddresses] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyAddressForm });

  const hasAddresses = addresses.length > 0;

  const loadAddresses = () =>
    customerApi
      .profile()
      .then(({ data }) => {
        const list = data.addresses || [];
        setAddresses(list);
        const defaultIndex = list.findIndex((addr) => addr.is_default);
        const index = defaultIndex >= 0 ? defaultIndex : 0;
        if (list[index]) {
          setSelectedKey(addressKey(list[index], index));
        } else {
          setSelectedKey('');
        }
      })
      .catch(() => toast.error('Failed to load addresses'));

  useEffect(() => {
    loadAddresses().finally(() => setLoading(false));
  }, []);

  const handleSelect = async (key) => {
    const index = addresses.findIndex((addr, i) => addressKey(addr, i) === key);
    if (index < 0) return;

    setSelectedKey(key);
    setSaving(true);
    try {
      const updatedAddresses = addresses.map((addr, i) => ({
        ...addr,
        is_default: i === index,
      }));
      const { data } = await customerApi.updateProfile({ addresses: updatedAddresses });
      const list = data.addresses || [];
      setAddresses(list);
      const selected = list[index];
      if (selected) {
        selectSavedAddress(selected);
      }
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update address');
      const defaultIndex = addresses.findIndex((addr) => addr.is_default);
      const fallbackIndex = defaultIndex >= 0 ? defaultIndex : 0;
      if (addresses[fallbackIndex]) {
        setSelectedKey(addressKey(addresses[fallbackIndex], fallbackIndex));
      }
    } finally {
      setSaving(false);
    }
  };

  const onAddAddress = async (data) => {
    setSaving(true);
    try {
      const newAddress = {
        label: data.label.trim(),
        line1: data.line1.trim(),
        city: data.city.trim(),
        pincode: data.pincode.trim(),
        is_default: addresses.length === 0,
      };
      const updatedAddresses = [...addresses, newAddress];
      const { data: profile } = await customerApi.updateProfile({ addresses: updatedAddresses });
      const list = profile.addresses || [];
      setAddresses(list);
      const defaultIndex = list.findIndex((addr) => addr.is_default);
      const index = defaultIndex >= 0 ? defaultIndex : list.length - 1;
      if (list[index]) {
        setSelectedKey(addressKey(list[index], index));
        selectSavedAddress(list[index]);
      }
      reset(emptyAddressForm);
      setShowAddForm(false);
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAdd = () => {
    reset(emptyAddressForm);
    setShowAddForm(false);
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

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/customer/profile"
              className="glass-icon-btn shrink-0"
              aria-label="Back to profile"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Saved Addresses</h1>
              <p className="mt-1 text-sm text-stone-500">
                {hasAddresses ? 'Select your default delivery address' : 'Add your first delivery address'}
              </p>
            </div>
          </div>

          {hasAddresses && !showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              Add New Address
            </button>
          )}
        </div>

        {!hasAddresses ? (
          <EmptyAddressForm
            onSubmit={handleSubmit(onAddAddress)}
            register={register}
            errors={errors}
            saving={saving}
          />
        ) : showAddForm ? (
          <form onSubmit={handleSubmit(onAddAddress)} className="card relative space-y-4 p-5">
            <button
              type="button"
              onClick={handleCancelAdd}
              className="glass-icon-btn absolute right-4 top-4 h-8 w-8 text-stone-500"
              aria-label="Close add address form"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="pr-10 text-sm font-semibold uppercase tracking-wide text-stone-500">New Address</h2>
            <AddressFormFields register={register} errors={errors} />
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr, index) => {
              const key = addressKey(addr, index);
              return (
                <RoundedRadio
                  key={key}
                  name="saved-address"
                  value={key}
                  checked={selectedKey === key}
                  disabled={saving}
                  onChange={handleSelect}
                  label={
                    <>
                      {addr.label}
                      {addr.is_default && (
                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                          Default
                        </span>
                      )}
                    </>
                  }
                  description={`${addr.line1}, ${addr.city} — ${addr.pincode}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
