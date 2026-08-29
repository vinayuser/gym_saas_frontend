import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Icon from './Icon';
import { logoutUser } from '../../store/slices/authSlice';

const OWNER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbKQvJH_7PIo7BojE2MjqJyvI5I-2z-kntpTQjDE2Ed5BjDQuAG6JGEayiVpRFh2575jnk_dutTTjZtt33mYulgk_1Qj11i5zfx3RpzKcR6KCQyNOw94hGfhgkEj0XmW76Hl5bZtyOyZ8DIu0w_LaDp_eqJ8v3HRMzJ0pL4K-t6mE5pW_LgQo3TPj-60I8O8zbf9XQUizNPSBxmGlOQOA1ETpp6Y8-cyA4ZDw1rplG4SB1XDd1Z1yWQhTEe08JxZk7bNZFMfhDIiY';

const avatarFallback = (user) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.firstName || 'U'}+${user?.lastName || ''}`
  )}&background=c3f400&color=161e00`;

const OwnerProfileMenu = ({ roleLabel = 'Gym Owner', avatarSrc }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await dispatch(logoutUser());
    navigate('/auth/login');
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const imgSrc = avatarSrc || OWNER_AVATAR;

  return (
    <div ref={ref} className="relative border-l border-white/10 pl-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-lg py-1 pr-1 transition-colors hover:bg-white/5"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-[10px] uppercase tracking-wider text-secondary">{roleLabel}</p>
        </div>
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20">
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = avatarFallback(user);
            }}
          />
        </div>
        <Icon
          name="expand_more"
          size={20}
          className={`hidden text-secondary transition-transform sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface-container shadow-2xl"
        >
          <div className="border-b border-white/5 px-4 py-3">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-secondary">{user?.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/owner/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-on-surface transition-colors hover:bg-white/5"
            >
              <Icon name="settings" size={18} className="text-secondary" />
              Settings
            </Link>
            <Link
              to="/owner/support"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-on-surface transition-colors hover:bg-white/5"
            >
              <Icon name="help" size={18} className="text-secondary" />
              Support
            </Link>
          </div>
          <div className="border-t border-white/5 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/10"
            >
              <Icon name="logout" size={18} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerProfileMenu;
