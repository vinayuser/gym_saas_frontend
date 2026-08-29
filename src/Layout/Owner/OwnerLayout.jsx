import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuthMiddleware from '../../useAuthMiddleware';
import OwnerSidebar from './OwnerSidebar';
import PageLoader from '../../components/Loader/PageLoader';
import { isAuthRestoring } from '../../helpers/authUtils';

const OwnerLayout = () => {
  useAuthMiddleware();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated } = auth;

  const authPending = isAuthRestoring(auth);

  if (!authPending && !isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <OwnerSidebar />
        <div className="ml-[280px] flex min-h-screen flex-col">
          <Outlet />
        </div>
      </div>
      <PageLoader show={authPending || !isAuthenticated} message="Authenticating..." />
    </>
  );
};

export default OwnerLayout;
