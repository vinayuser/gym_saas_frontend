import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canAccessRoute, getDefaultPath } from '../helpers/roleUtils';
import { isAuthRestoring } from '../helpers/authUtils';

const ProtectedRoute = ({ children, allowedRoles = [], fallbackPath }) => {
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, user } = auth;

  if (isAuthRestoring(auth)) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  const redirectTo = fallbackPath || getDefaultPath(user);

  if (allowedRoles.length && !canAccessRoute(user, allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
