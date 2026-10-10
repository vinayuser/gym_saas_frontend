import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import useAuthMiddleware from '../../useAuthMiddleware';
import OwnerSidebar from './OwnerSidebar';
import PageLoader from '../../components/Loader/PageLoader';
import { isAuthRestoring } from '../../helpers/authUtils';
import { logout } from '../../store/slices/authSlice';
import { ROLES } from '../../constants';

const OwnerLayout = () => {
  useAuthMiddleware();
  const dispatch = useDispatch();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, user } = auth;

  const authPending = isAuthRestoring(auth);

  useEffect(() => {
    if (user?.role === ROLES.MEMBER) dispatch(logout());
  }, [user, dispatch]);

  if (!authPending && (!isAuthenticated || user?.role === ROLES.MEMBER)) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }
  if (!authPending && user?.role === ROLES.PLATFORM_ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      <div className="h-screen overflow-hidden bg-background">
        <OwnerSidebar />
        <div className="custom-scrollbar ml-[280px] h-screen overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <PageLoader show={authPending || !isAuthenticated} message="Authenticating..." />
    </>
  );
};

export default OwnerLayout;
