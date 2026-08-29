import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuthMiddleware from '../../useAuthMiddleware';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PageLoader from '../../components/Loader/PageLoader';

const DashboardLayout = () => {
  useAuthMiddleware();
  const { isAuthenticated, loading, profileFetchStatus, token } = useSelector(
    (state) => state.auth
  );

  const authPending =
    loading ||
    (Boolean(token) && profileFetchStatus !== 'succeeded' && profileFetchStatus !== 'failed');

  return (
    <>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <PageLoader show={authPending || !isAuthenticated} message="Authenticating..." />
    </>
  );
};

export default DashboardLayout;
