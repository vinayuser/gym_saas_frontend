import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { getDefaultPath } from '../../helpers/roleUtils';
import Icon from '../../components/fitsphere/Icon';
import GlassCard from '../../components/fitsphere/GlassCard';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBHzMmSj_5Mge482WKTWSU4Reo4VQB49O1ImR7imDFRsUCFOu64dTykmaPAdSy1eXAfYCMzbycprxQgeTdW3Yl-xlEvQA5F47DupzBOto_bJh7SZW4EnTXRnPneCNxolafIU7wRCoSgV6i67CpT-fjPVy2fAk8kelEnRw1WjVlZqTq9Sc9yLPRhzOzELdiNg1RvHCDShQCoal3PyPh-B7HDdwMpW_aG1AtucfufR3pZHHOp23tO1El6bMruaBKxODCGWI98qRAVq1s';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const target = location.state?.from?.pathname || getDefaultPath(result.payload.user);
      navigate(target, { replace: true });
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
      <section className="relative hidden h-screen overflow-hidden md:flex md:w-1/2 lg:w-3/5">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/80" />
        <div className="absolute left-8 top-16">
          <span className="font-display text-2xl font-bold text-primary-fixed">FitSphere</span>
        </div>
        <GlassCard className="absolute bottom-16 left-8 right-8 max-w-2xl p-8">
          <div className="mb-4 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Icon key={i} name="star" size={20} className="text-primary-fixed" filled />
            ))}
          </div>
          <p className="text-lg italic leading-relaxed text-white">
            &ldquo;FitSphere transformed the way our gym operates. The data visualization and member
            management are leagues ahead of anything we used before.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-white/20">
              <img
                src="https://ui-avatars.com/api/?name=Marcus+Sterling&background=c3f400&color=161e00"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-white">Marcus Sterling</p>
              <p className="text-xs text-secondary">Founder, Apex Elite Studios</p>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="relative flex flex-1 flex-col items-center justify-center bg-surface px-6 py-12 md:px-12">
        <div className="absolute bottom-0 right-0 -z-10 h-64 w-64 rounded-full bg-primary-fixed/5 blur-[120px]" />
        <div className="mb-8 md:hidden">
          <span className="font-display text-2xl font-bold text-primary-fixed">FitSphere</span>
        </div>

        <div className="w-full max-w-[440px]">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-secondary">Enter your credentials to access your dashboard</p>
          </header>

          {error && (
            <div className="mb-4 rounded-lg border border-error-container/50 bg-error-container/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="relative mb-6 flex items-center">
            <div className="flex-grow border-t border-white/5" />
            <span className="mx-4 text-xs uppercase tracking-widest text-secondary">Sign in with email</span>
            <div className="flex-grow border-t border-white/5" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">
                Email Address
              </label>
              <div className="relative">
                <Icon name="mail" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="owner@demo.com"
                  className="fitsphere-input-icon"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  Password
                </label>
                <button type="button" className="text-xs text-primary-fixed hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Icon name="lock" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="fitsphere-input-icon pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-surface-container-lowest text-primary-fixed focus:ring-primary-fixed"
              />
              <span className="text-sm text-secondary">Remember me for 30 days</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="neon-glow mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-fixed py-3 font-bold text-on-primary-fixed transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Icon name="progress_activity" size={22} className="animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <Icon name="arrow_forward" size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="font-bold text-white hover:text-primary-fixed">
              Start free trial
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-secondary/60">Demo: owner@demo.com / Owner@123</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
