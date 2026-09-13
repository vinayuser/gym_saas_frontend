import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './slices/authSlice';
import gymReducer from './slices/gymSlice';
import memberReducer from './slices/memberSlice';
import staffReducer from './slices/staffSlice';
import bannerReducer from './slices/bannerSlice';
import { bindForceLogout } from '../config/axiosInstance';

const store = configureStore({
  reducer: {
    auth: authReducer,
    gym: gymReducer,
    member: memberReducer,
    staff: staffReducer,
    banner: bannerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginUser/fulfilled', 'auth/registerUser/fulfilled'],
      },
    }),
});

bindForceLogout(() => {
  store.dispatch(logout());
  const path = window.location.pathname || '';
  if (!path.startsWith('/auth') && !path.startsWith('/setup')) {
    window.location.assign('/auth/login');
  }
});

export default store;
