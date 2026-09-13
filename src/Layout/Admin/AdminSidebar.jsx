import { NavLink } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import { ADMIN_NAV } from '../../constants/adminNavigation';

const AdminSidebar = () => (
  <aside className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-white/10 bg-surface/80 py-10 backdrop-blur-xl">
    <div className="mb-10 px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon">
          <Icon name="fitness_center" size={22} className="text-on-primary-fixed" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-tight text-primary-container">
            FitSphere Pro
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
            Super Admin
          </p>
        </div>
      </div>
    </div>

    <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-2 pb-6">
      {ADMIN_NAV.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={
            item.path === '/admin/dashboard' ||
            item.path === '/admin/invites' ||
            item.path === '/admin/gym-owners' ||
            item.path === '/admin/transactions' ||
            item.path === '/admin/support' ||
            item.path === '/admin/plans' ||
            item.path === '/admin/settings' ||
            item.path === '/admin/tenants'
          }
          className={({ isActive }) => (isActive ? 'nav-item nav-active' : 'nav-item')}
        >
          <Icon name={item.icon} size={22} />
          <span className="text-sm font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;
