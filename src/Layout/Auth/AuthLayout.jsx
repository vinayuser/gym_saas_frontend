import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultPath } from '../../helpers/roleUtils';
import { isAuthRestoring } from '../../helpers/authUtils';

const AuthLayout = () => {
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, user } = auth;

  if (isAuthRestoring(auth)) {
    return null;
  }

  if (isAuthenticated && user) {
    const target = location.state?.from?.pathname || getDefaultPath(user);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default AuthLayout;
