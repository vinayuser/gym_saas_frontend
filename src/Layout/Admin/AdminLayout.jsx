import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuthMiddleware from '../../useAuthMiddleware';
import { ROLES } from '../../constants';
import { ADMIN_NAV } from '../../constants/adminNavigation';
import { hasPlatformPermission } from '../../helpers/roleUtils';
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
  const isPlatformUser = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.PLATFORM_ADMIN;
  if (!authPending && isAuthenticated && !isPlatformUser) {
    return <Navigate to="/owner/dashboard" replace />;
  }

  const pathRule = [...ADMIN_NAV].reverse().find((item) => location.pathname.startsWith(item.path));
  if (!authPending && isPlatformUser && pathRule && !hasPlatformPermission(user, pathRule.permission)) {
    const fallback = ADMIN_NAV.find((item) => hasPlatformPermission(user, item.permission));
    return <Navigate to={fallback?.path || '/auth/login'} replace />;
  }

  return (
    <>
      <div className="h-screen overflow-hidden bg-background">
        <AdminSidebar />
        <div className="custom-scrollbar ml-[280px] h-screen overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <PageLoader show={authPending} message="Authenticating..." />
    </>
  );
};

export default AdminLayout;
