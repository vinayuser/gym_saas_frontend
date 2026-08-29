import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, postRequest, putRequest, deleteRequest } from '../../config/dataApi';
import { withQuery } from '../../helpers/apiQuery';
import { toast } from 'react-toastify';

const initialState = {
  staff: [],
  currentStaff: null,
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
};

export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async ({ gymId, ...params }, { rejectWithValue }) => {
    try {
      const response = await getRequest(withQuery(ENDPOINTS.STAFF.LIST(gymId), params));
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch staff');
    }
  },
  {
    condition: (_, { getState }) => !getState().staff.loading,
  }
);

export const fetchStaffById = createAsyncThunk(
  'staff/fetchStaffById',
  async ({ gymId, staffId }, { rejectWithValue }) => {
    try {
      const response = await getRequest(ENDPOINTS.STAFF.BY_ID(gymId, staffId));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch staff member');
    }
  }
);

export const createStaff = createAsyncThunk(
  'staff/createStaff',
  async ({ gymId, data }, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.STAFF.CREATE(gymId), data);
      toast.success('Staff member created successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create staff member');
    }
  }
);

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async ({ gymId, staffId, data }, { rejectWithValue }) => {
    try {
      const response = await putRequest(ENDPOINTS.STAFF.UPDATE(gymId, staffId), data);
      toast.success('Staff member updated successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update staff member');
    }
  }
);

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async ({ gymId, staffId }, { rejectWithValue }) => {
    try {
      await deleteRequest(ENDPOINTS.STAFF.DELETE(gymId, staffId));
      toast.success('Staff member removed');
      return staffId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove staff member');
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearCurrentStaff: (state) => {
      state.currentStaff = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload.data || [];
        state.pagination = action.payload.meta?.pagination || state.pagination;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.currentStaff = action.payload;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staff.unshift(action.payload);
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const idx = state.staff.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.staff[idx] = action.payload;
        state.currentStaff = action.payload;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter((s) => s.id !== action.payload);
      });
  },
});

export const { clearCurrentStaff } = staffSlice.actions;
export default staffSlice.reducer;
