import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest } from '../../config/dataApi';
import { ADMIN_NAV } from '../../constants/adminNavigation';
import { OWNER_NAV } from '../../constants/ownerNavigation';
import { ROLES } from '../../constants';
import { hasPlatformPermission } from '../../helpers/roleUtils';
import { formatDateTime } from '../../helpers/formatUtils';

const SEEN_KEY = 'fitsphere-seen-notifications';

const readSeen = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const flattenNav = (items) =>
  items.flatMap((item) => {
    if (item.children?.length) {
      return item.children.map((child) => ({
        label: `${item.label} · ${child.label}`,
        path: child.path,
        icon: child.icon || item.icon,
      }));
    }
    if (!item.path) return [];
    return [{ label: item.label, path: item.path, icon: item.icon }];
  });

export const NotificationMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seen, setSeen] = useState(readSeen);

  const unread = items.filter((item) => !seen.has(item.id)).length;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRequest(ENDPOINTS.NOTIFICATIONS)
      .then((res) => {
        if (!cancelled) setItems(res.data?.items || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markSeen = (nextItems = items) => {
    const next = new Set(seen);
    nextItems.forEach((item) => next.add(item.id));
    localStorage.setItem(SEEN_KEY, JSON.stringify([...next]));
    setSeen(next);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) markSeen();
        }}
        className="relative text-secondary transition-colors hover:text-primary-fixed"
      >
        <Icon name="notifications" size={24} />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-neon" />
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-xl border border-white/10 bg-surface-container shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <button type="button" onClick={() => setOpen(false)} className="text-secondary hover:text-on-surface">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="custom-scrollbar max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-secondary">Loading...</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-secondary">No new notifications.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (item.href) navigate(item.href);
                  }}
                  className="block w-full border-b border-white/5 px-4 py-3 text-left hover:bg-white/5"
                >
                  <p className="text-sm font-medium text-on-surface">{item.title}</p>
                  <p className="mt-0.5 text-xs text-secondary">{item.message}</p>
                  <p className="mt-1 text-[10px] text-secondary/70">{formatDateTime(item.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const AppLauncher = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, tenant } = useSelector((state) => state.auth);
  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.PLATFORM_ADMIN;
  const features = tenant?.features;

  const source = isAdmin
    ? ADMIN_NAV.filter((item) => hasPlatformPermission(user, item.permission))
    : OWNER_NAV.filter((item) => {
        if (!item.feature) return true;
        if (!features || features[item.feature] === undefined) return true;
        return Boolean(features[item.feature]);
      });
  const modules = flattenNav(source);

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        aria-label="Open module launcher"
        aria-expanded={open}
        title="All modules"
        onClick={() => setOpen((value) => !value)}
        className="text-secondary transition-colors hover:text-primary-fixed"
      >
        <Icon name="apps" size={24} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-80 rounded-xl border border-white/10 bg-surface-container p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <div>
              <p className="text-sm font-semibold">All modules</p>
              <p className="text-[11px] text-secondary">Jump to any section of the app</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-secondary hover:text-on-surface">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="custom-scrollbar grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
            {modules.map((mod) => (
              <button
                key={mod.path}
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(mod.path);
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-on-surface hover:bg-white/5 hover:text-primary-fixed"
              >
                <Icon name={mod.icon} size={18} className="shrink-0 text-primary-fixed" />
                <span className="truncate">{mod.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
