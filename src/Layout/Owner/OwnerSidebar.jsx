import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Icon from '../../components/fitsphere/Icon';
import { OWNER_NAV } from '../../constants/ownerNavigation';

const NavItem = ({ item }) => {
  const location = useLocation();
  const hasChildren = Boolean(item.children);
  const isGroupActive =
    hasChildren && item.children.some((child) => location.pathname.startsWith(child.path));
  const [open, setOpen] = useState(isGroupActive);

  useEffect(() => {
    if (isGroupActive) setOpen(true);
  }, [isGroupActive]);

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left transition-colors hover:bg-white/5 ${
            isGroupActive ? 'text-primary-fixed' : 'text-secondary'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Icon name={item.icon} size={22} />
            {item.label}
          </span>
          <Icon name={open ? 'expand_less' : 'expand_more'} size={20} />
        </button>
        {open && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-r-lg py-2 pl-4 pr-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-white/5 font-medium text-primary-fixed'
                      : 'text-secondary hover:text-primary-fixed'
                  }`
                }
              >
                <Icon name={child.icon} size={18} />
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/owner/dashboard'}
      className={({ isActive }) => (isActive ? 'nav-item nav-active' : 'nav-item')}
    >
      <Icon name={item.icon} size={22} />
      <span className="text-sm font-medium">{item.label}</span>
    </NavLink>
  );
};

const OwnerSidebar = () => {
  const { currentGym } = useSelector((state) => state.gym);

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-white/10 bg-surface/80 py-10 backdrop-blur-xl">
      <div className="mb-10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon">
            <Icon name="fitness_center" size={22} className="text-on-primary-fixed" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight text-primary-fixed">
              FitSphere Pro
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
              {currentGym?.name || 'Select branch'}
            </p>
          </div>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-2 pb-6">
        {OWNER_NAV.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
};

export default OwnerSidebar;
