import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import GlassCard from '../../components/fitsphere/GlassCard';

const Register = () => (
  <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
    <GlassCard className="w-full max-w-lg p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon">
          <Icon name="fitness_center" size={22} className="text-on-primary-fixed" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-primary-fixed">FitSphere Pro</h2>
          <p className="text-xs text-secondary">Invite-only onboarding</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-secondary">
        Gym owner accounts are created from a private invite. Request access from our team, finish
        setup, and pay for your first gym. Members receive a login from their gym after they are added.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link
          to="/contact"
          className="neon-glow block rounded-lg bg-primary-fixed py-3 text-center font-bold text-on-primary-fixed"
        >
          Request an invite
        </Link>
        <Link to="/auth/login" className="block rounded-lg border border-white/15 py-3 text-center font-semibold">
          Sign in
        </Link>
      </div>
    </GlassCard>
  </div>
);

export default Register;
