import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getNavigationMenu } from '../../helpers/roleUtils';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Dumbbell,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Dumbbell,
};

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const menu = getNavigationMenu(user);

  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
        <Dumbbell className="h-7 w-7 text-blue-400" />
        <span className="text-lg font-bold">GymSaaS</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menu.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <p className="truncate text-xs text-slate-400">{user?.email}</p>
        <p className="text-xs font-medium text-slate-300">{user?.firstName} {user?.lastName}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
