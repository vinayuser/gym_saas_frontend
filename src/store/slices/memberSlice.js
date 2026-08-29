import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, postRequest, putRequest, deleteRequest } from '../../config/dataApi';
import { withQuery } from '../../helpers/apiQuery';
import { toast } from 'react-toastify';

const initialState = {
  members: [],
  currentMember: null,
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
};

export const fetchMembers = createAsyncThunk(
  'member/fetchMembers',
  async ({ gymId, ...params }, { rejectWithValue }) => {
    try {
      const response = await getRequest(withQuery(ENDPOINTS.MEMBERS.LIST(gymId), params));
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch members');
    }
  },
  {
    condition: (_, { getState }) => {
      const { loading, members } = getState().member;
      // Allow refetch when list is empty (e.g. after navigation) even if loading flag is set
      return !loading || members.length === 0;
    },
  }
);

export const fetchMemberById = createAsyncThunk(
  'member/fetchMemberById',
  async ({ gymId, memberId }, { rejectWithValue }) => {
    try {
      const response = await getRequest(ENDPOINTS.MEMBERS.BY_ID(gymId, memberId));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch member');
    }
  }
);

export const createMember = createAsyncThunk(
  'member/createMember',
  async ({ gymId, data }, { rejectWithValue }) => {
    try {
      const response = await postRequest(ENDPOINTS.MEMBERS.CREATE(gymId), data);
      toast.success('Member created successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create member');
    }
  }
);

export const updateMember = createAsyncThunk(
  'member/updateMember',
  async ({ gymId, memberId, data }, { rejectWithValue }) => {
    try {
      const response = await putRequest(ENDPOINTS.MEMBERS.UPDATE(gymId, memberId), data);
      toast.success('Member updated successfully');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update member');
    }
  }
);

export const deleteMember = createAsyncThunk(
  'member/deleteMember',
  async ({ gymId, memberId }, { rejectWithValue }) => {
    try {
      await deleteRequest(ENDPOINTS.MEMBERS.DELETE(gymId, memberId));
      toast.success('Member deleted successfully');
      return memberId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete member');
    }
  }
);

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.data || [];
        state.pagination = action.payload.meta?.pagination || state.pagination;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMemberById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMember = action.payload;
      })
      .addCase(fetchMemberById.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        const exists = state.members.some((m) => m.id === action.payload.id);
        if (!exists) {
          state.members.unshift(action.payload);
          state.pagination.total = (state.pagination.total || 0) + 1;
        }
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        const idx = state.members.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.members[idx] = action.payload;
        state.currentMember = action.payload;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.id !== action.payload);
      });
  },
});

export const { clearCurrentMember } = memberSlice.actions;
export default memberSlice.reducer;
