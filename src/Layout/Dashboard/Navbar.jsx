import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';
import { setCurrentGym } from '../../store/slices/gymSlice';
import { Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchGyms } from '../../store/slices/gymSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, tenant } = useSelector((state) => state.auth);
  const { gyms, currentGym } = useSelector((state) => state.gym);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    dispatch(fetchGyms({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const savedGymId = localStorage.getItem('selectedGymId');
    if (savedGymId && gyms.length) {
      const gym = gyms.find((g) => g.id === savedGymId);
      if (gym) dispatch(setCurrentGym(gym));
      else if (gyms[0]) dispatch(setCurrentGym(gyms[0]));
    } else if (gyms.length && !currentGym) {
      dispatch(setCurrentGym(gyms[0]));
    }
  }, [gyms, dispatch, currentGym]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/auth/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        {tenant && (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {tenant.name}
          </span>
        )}

        {gyms.length > 0 && (
          <div className="relative">
            <select
              value={currentGym?.id || ''}
              onChange={(e) => {
                const gym = gyms.find((g) => g.id === e.target.value);
                if (gym) dispatch(setCurrentGym(gym));
              }}
              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <span className="text-sm text-slate-600 dark:text-slate-300">
          {user?.firstName} {user?.lastName}
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
