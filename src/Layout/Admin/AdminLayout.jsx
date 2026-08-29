import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuthMiddleware from '../../useAuthMiddleware';
import { ROLES } from '../../constants';
import AdminSidebar from './AdminSidebar';
import PageLoader from '../../components/Loader/PageLoader';
import { isAuthRestoring } from '../../helpers/authUtils';

const AdminLayout = () => {
  useAuthMiddleware();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, user } = auth;

  const authPending = isAuthRestoring(auth);

  if (!authPending && !isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }
  if (!authPending && isAuthenticated && user?.role !== ROLES.SUPER_ADMIN) {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="ml-[280px] flex min-h-screen flex-col">
          <Outlet />
        </div>
      </div>
      <PageLoader show={authPending} message="Authenticating..." />
    </>
  );
};

export default AdminLayout;
