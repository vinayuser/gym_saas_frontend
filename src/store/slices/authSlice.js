import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ENDPOINTS from '../../config/apiUrls';
import axiosInstance, { setAuthToken } from '../../config/axiosInstance';
import { postRequest, getRequest } from '../../config/dataApi';
import { getUserRoleInfo } from '../../helpers/roleUtils';
import { getToken, setTokens, clearTokens } from '../../helpers/utils';
import { toast } from 'react-toastify';

const initialState = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  token: getToken(),
  loading: false,
  profileFetchStatus: 'idle',
  error: null,
  pendingTwoFactorToken: null,
  userRoleInfo: getUserRoleInfo(null),
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.AUTH.LOGIN, { email, password });
      if (response.success && response.data?.requiresTwoFactor) {
        return { requiresTwoFactor: true, twoFactorToken: response.data.twoFactorToken };
      }
      if (response.success && response.data?.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        setAuthToken(accessToken);
        setTokens(accessToken, refreshToken);
        return response.data;
      }
      return rejectWithValue('Invalid email or password.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const verifyTwoFactorLogin = createAsyncThunk(
  'auth/verifyTwoFactorLogin',
  async ({ twoFactorToken, code }, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.AUTH.LOGIN_2FA, { twoFactorToken, code });
      if (response.success && response.data?.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        setAuthToken(accessToken);
        setTokens(accessToken, refreshToken);
        return response.data;
      }
      return rejectWithValue('Invalid authentication code.');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Verification failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.AUTH.REGISTER, formData);
      if (response.success && response.data?.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        setAuthToken(accessToken);
        setTokens(accessToken, refreshToken);
        toast.success('Registration successful!');
        return response.data;
      }
      return rejectWithValue('Registration failed');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUserProfile = createAsyncThunk(
  'auth/fetchCurrentUserProfile',
  async (_arg, { rejectWithValue }) => {
    try {
      const response = await getRequest(ENDPOINTS.AUTH.PROFILE);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch profile');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Profile fetch failed');
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { auth } = getState();
      if (auth.profileFetchStatus === 'loading') return false;
      if (auth.profileFetchStatus === 'succeeded' && auth.user) return false;
      return true;
    },
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    if (refreshToken) {
      await postRequest(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    }
  } catch {
    // ignore logout API errors
  }
  setAuthToken(null);
  clearTokens();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearPendingTwoFactor: (state) => {
      state.pendingTwoFactorToken = null;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tenant = null;
      state.token = null;
      state.profileFetchStatus = 'idle';
      state.pendingTwoFactorToken = null;
      state.userRoleInfo = getUserRoleInfo(null);
      setAuthToken(null);
      clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.pendingTwoFactorToken = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.requiresTwoFactor) {
          state.error = null;
          state.pendingTwoFactorToken = action.payload.twoFactorToken || null;
          return;
        }
        state.pendingTwoFactorToken = null;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.token = action.payload.tokens.accessToken;
        state.profileFetchStatus = 'succeeded';
        state.userRoleInfo = getUserRoleInfo(action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pendingTwoFactorToken = null;
      })
      .addCase(verifyTwoFactorLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactorLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTwoFactorToken = null;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.token = action.payload.tokens.accessToken;
        state.profileFetchStatus = 'succeeded';
        state.userRoleInfo = getUserRoleInfo(action.payload.user);
      })
      .addCase(verifyTwoFactorLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.token = action.payload.tokens.accessToken;
        state.userRoleInfo = getUserRoleInfo(action.payload.user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.loading = true;
        state.profileFetchStatus = 'loading';
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileFetchStatus = 'succeeded';
        state.isAuthenticated = true;
        const payload = action.payload;
        state.user = payload.user ?? payload;
        state.tenant = payload.tenant ?? state.tenant;
        state.userRoleInfo = getUserRoleInfo(state.user);
      })
      .addCase(fetchCurrentUserProfile.rejected, (state) => {
        state.loading = false;
        state.profileFetchStatus = 'failed';
        state.isAuthenticated = false;
        state.user = null;
        state.tenant = null;
        state.token = null;
        setAuthToken(null);
        clearTokens();
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.tenant = null;
        state.token = null;
        state.profileFetchStatus = 'idle';
        state.pendingTwoFactorToken = null;
        state.userRoleInfo = getUserRoleInfo(null);
      });
  },
});

export const { logout, clearPendingTwoFactor } = authSlice.actions;
export default authSlice.reducer;
