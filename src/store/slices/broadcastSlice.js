import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import ENDPOINTS from '../../config/apiUrls';
import { deleteRequest, getRequest, postRequest } from '../../config/dataApi';

const initialState = {
  current: null,
  loading: false,
};

export const fetchActiveBroadcast = createAsyncThunk(
  'broadcast/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getRequest(ENDPOINTS.BROADCASTS.ACTIVE);
      return res.data?.broadcast || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load broadcast');
    }
  }
);

export const createBroadcast = createAsyncThunk(
  'broadcast/create',
  async (message, { rejectWithValue }) => {
    try {
      const res = await postRequest(ENDPOINTS.BROADCASTS.CREATE, { message });
      return res.data?.broadcast || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send broadcast');
    }
  }
);

export const removeBroadcast = createAsyncThunk(
  'broadcast/remove',
  async (_, { rejectWithValue }) => {
    try {
      await deleteRequest(ENDPOINTS.BROADCASTS.REMOVE);
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove broadcast');
    }
  }
);

const broadcastSlice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveBroadcast.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveBroadcast.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchActiveBroadcast.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createBroadcast.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(removeBroadcast.fulfilled, (state) => {
        state.current = null;
      });
  },
});

export default broadcastSlice.reducer;
