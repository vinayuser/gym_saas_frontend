import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { getDefaultPath } from '../../helpers/roleUtils';
import Icon from '../../components/fitsphere/Icon';
import GlassCard from '../../components/fitsphere/GlassCard';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate(getDefaultPath(result.payload.user));
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="absolute bottom-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary-fixed/5 blur-[120px]" />
      <GlassCard className="w-full max-w-lg p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon">
            <Icon name="fitness_center" size={22} className="text-on-primary-fixed" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-primary-fixed">FitSphere Pro</h2>
            <p className="text-xs text-secondary">Start your 14-day free trial</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-error-container/50 bg-error-container/20 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="First Name"
              value={form.firstName}
              onChange={update('firstName')}
              className="fitsphere-input"
            />
            <input
              required
              placeholder="Last Name"
              value={form.lastName}
              onChange={update('lastName')}
              className="fitsphere-input"
            />
          </div>
          <input
            required
            placeholder="Business / Gym Name"
            value={form.businessName}
            onChange={update('businessName')}
            className="fitsphere-input"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={update('email')}
            className="fitsphere-input"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={update('phone')}
            className="fitsphere-input"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 chars)"
            value={form.password}
            onChange={update('password')}
            className="fitsphere-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="neon-glow mt-2 w-full rounded-lg bg-primary-fixed py-3 font-bold text-on-primary-fixed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-bold text-primary-fixed hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default Register;
