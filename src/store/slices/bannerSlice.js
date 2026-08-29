import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, postRequest, putRequest, deleteRequest } from '../../config/dataApi';
import { withQuery } from '../../helpers/apiQuery';
import { toast } from 'react-toastify';

const initialState = {
  banners: [],
  currentBanner: null,
  stats: null,
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
};

export const fetchBanners = createAsyncThunk(
  'banner/fetchBanners',
  async ({ gymId, ...params }, { rejectWithValue }) => {
    try {
      const response = await getRequest(withQuery(ENDPOINTS.BANNERS.LIST(gymId), params));
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch banners');
    }
  },
  {
    condition: (_, { getState }) => !getState().banner.loading,
  }
);

export const fetchBannerStats = createAsyncThunk(
  'banner/fetchBannerStats',
  async ({ gymId }, { rejectWithValue }) => {
    try {
      const response = await getRequest(ENDPOINTS.BANNERS.STATS(gymId));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch banner stats');
    }
  }
);

export const fetchBannerById = createAsyncThunk(
  'banner/fetchBannerById',
  async ({ gymId, bannerId }, { rejectWithValue }) => {
    try {
      const response = await getRequest(ENDPOINTS.BANNERS.BY_ID(gymId, bannerId));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch banner');
    }
  }
);

export const createBanner = createAsyncThunk(
  'banner/createBanner',
  async ({ gymId, data }, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.BANNERS.CREATE(gymId), data);
      toast.success('Banner created successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create banner');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banner/updateBanner',
  async ({ gymId, bannerId, data }, { rejectWithValue }) => {
    try {
      const response = await putRequest(ENDPOINTS.BANNERS.UPDATE(gymId, bannerId), data);
      toast.success('Banner updated successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update banner');
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banner/deleteBanner',
  async ({ gymId, bannerId }, { rejectWithValue }) => {
    try {
      await deleteRequest(ENDPOINTS.BANNERS.DELETE(gymId, bannerId));
      toast.success('Banner removed');
      return bannerId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove banner');
    }
  }
);

export const duplicateBanner = createAsyncThunk(
  'banner/duplicateBanner',
  async ({ gymId, bannerId }, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.BANNERS.DUPLICATE(gymId, bannerId));
      toast.success('Banner duplicated');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to duplicate banner');
    }
  }
);

const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  reducers: {
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data || [];
        state.pagination = action.payload.meta?.pagination || state.pagination;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBannerStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.currentBanner = action.payload;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.banners.unshift(action.payload);
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        const idx = state.banners.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.banners[idx] = action.payload;
        state.currentBanner = action.payload;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter((b) => b.id !== action.payload);
      })
      .addCase(duplicateBanner.fulfilled, (state, action) => {
        state.banners.unshift(action.payload);
      });
  },
});

export const { clearCurrentBanner } = bannerSlice.actions;
export default bannerSlice.reducer;
