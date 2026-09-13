import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, postRequest, putRequest, deleteRequest } from '../../config/dataApi';
import { toast } from 'react-toastify';
import {
  fetchCurrentUserProfile,
  loginUser,
  logoutUser,
  verifyTwoFactorLogin,
} from './authSlice';

const pickInitialGym = (gyms, currentGym) => {
  if (!gyms?.length) return null;
  const savedId = localStorage.getItem('selectedGymId');
  if (savedId) {
    const saved = gyms.find((g) => g.id === savedId);
    if (saved) return saved;
  }
  if (currentGym && gyms.some((g) => g.id === currentGym.id)) return currentGym;
  return gyms[0];
};

const applyGymsFromAuth = (state, gyms) => {
  state.gyms = gyms || [];
  state.loading = false;
  const next = pickInitialGym(state.gyms, state.currentGym);
  if (next) state.currentGym = next;
};

const initialState = {
  gyms: [],
  currentGym: null,
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
};

export const fetchGyms = createAsyncThunk(
  'gym/fetchGyms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${ENDPOINTS.GYMS.LIST}?${query}` : ENDPOINTS.GYMS.LIST;
      const response = await getRequest(url);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch gyms');
    }
  },
  {
    condition: (_, { getState }) => !getState().gym.loading,
  }
);

export const fetchGymById = createAsyncThunk(
  'gym/fetchGymById',
  async (gymId, { rejectWithValue }) => {
    try {
      const response = await getRequest(ENDPOINTS.GYMS.BY_ID(gymId));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch gym');
    }
  }
);

export const createGym = createAsyncThunk(
  'gym/createGym',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.GYMS.CREATE, data);
      toast.success('Gym created successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create gym');
    }
  }
);

export const updateGym = createAsyncThunk(
  'gym/updateGym',
  async ({ gymId, data }, { rejectWithValue }) => {
    try {
      const response = await putRequest(ENDPOINTS.GYMS.UPDATE(gymId), data);
      toast.success('Gym updated successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update gym');
    }
  }
);

export const deleteGym = createAsyncThunk(
  'gym/deleteGym',
  async (gymId, { rejectWithValue }) => {
    try {
      await deleteRequest(ENDPOINTS.GYMS.DELETE(gymId));
      toast.success('Gym deleted successfully');
      return gymId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete gym');
    }
  }
);

const gymSlice = createSlice({
  name: 'gym',
  initialState,
  reducers: {
    setCurrentGym: (state, action) => {
      state.currentGym = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedGymId', action.payload.id);
      }
    },
    clearCurrentGym: (state) => {
      state.currentGym = null;
      localStorage.removeItem('selectedGymId');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGyms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGyms.fulfilled, (state, action) => {
        state.loading = false;
        state.gyms = action.payload.data || [];
        state.pagination = action.payload.meta?.pagination || state.pagination;
      })
      .addCase(fetchGyms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchGymById.fulfilled, (state, action) => {
        state.currentGym = action.payload;
      })
      .addCase(createGym.fulfilled, (state, action) => {
        state.gyms.unshift(action.payload);
      })
      .addCase(updateGym.fulfilled, (state, action) => {
        const idx = state.gyms.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) state.gyms[idx] = action.payload;
        if (state.currentGym?.id === action.payload.id) {
          state.currentGym = action.payload;
        }
      })
      .addCase(deleteGym.fulfilled, (state, action) => {
        state.gyms = state.gyms.filter((g) => g.id !== action.payload);
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        applyGymsFromAuth(state, action.payload?.gyms);
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload?.requiresTwoFactor) return;
        applyGymsFromAuth(state, action.payload?.gyms);
      })
      .addCase(verifyTwoFactorLogin.fulfilled, (state, action) => {
        applyGymsFromAuth(state, action.payload?.gyms);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.gyms = [];
        state.currentGym = null;
      });
  },
});

export const { setCurrentGym, clearCurrentGym } = gymSlice.actions;
export default gymSlice.reducer;
