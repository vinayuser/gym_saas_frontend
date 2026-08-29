import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gymReducer from './slices/gymSlice';
import memberReducer from './slices/memberSlice';
import staffReducer from './slices/staffSlice';
import bannerReducer from './slices/bannerSlice';

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

export default store;
