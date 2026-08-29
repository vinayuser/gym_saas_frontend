import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUserProfile, logout } from './store/slices/authSlice';
import { setAuthToken } from './config/axiosInstance';
import { getToken } from './helpers/utils';

const useAuthMiddleware = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      dispatch(logout());
      navigate('/auth/login');
      return;
    }

    setAuthToken(token);
    dispatch(fetchCurrentUserProfile());
  }, [dispatch, navigate]);

  return { isAuthenticated, loading };
};

export default useAuthMiddleware;
