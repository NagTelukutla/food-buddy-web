import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerApi } from '../api/restaurantApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function RegisterPage() {
  const { establishSession } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const resolvePostRegisterPath = () => {
    const from = location.state?.from?.pathname;
    if (from) return from;
    if (items.length > 0) return '/checkout';
    return '/customer/profile';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: tokenData } = await customerApi.register(data);
      await establishSession(tokenData);
      toast.success('Account created!');
      navigate(resolvePostRegisterPath(), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-auth-shell">
      <div className="glass-surface-strong w-full max-w-md p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input className="input-field" placeholder="Full name" {...register('full_name', { required: true })} />
          <input className="input-field" placeholder="Username" {...register('username', { required: true })} />
          <input className="input-field" placeholder="Email" type="email" {...register('email', { required: true })} />
          <input className="input-field" placeholder="Phone" {...register('phone', { required: true })} />
          <input type="password" className="input-field" placeholder="Password" {...register('password', { required: true, minLength: 6 })} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-brand-600 hover:underline">Already have an account?</Link>
        </p>
      </div>
    </div>
  );
}
