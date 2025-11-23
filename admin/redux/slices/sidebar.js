import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../util/api";

export const addSidebarItems = createAsyncThunk(
  "sidebar/addItems",
  async (items, { rejectWithValue }) => {
    try {
      const response = await api.post("/sidebar/items", items);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: error.message });
    }
  }
);

export const fetchSidebarItems = createAsyncThunk(
  "sidebar/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/sidebar/items");
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: error.message });
    }
  }
);

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    data: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addSidebarItems.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(addSidebarItems.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload?.message || "Sidebar items added";
    });
    builder.addCase(addSidebarItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message;
    });

    builder.addCase(fetchSidebarItems.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSidebarItems.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload?.items || action.payload;
    });
    builder.addCase(fetchSidebarItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message;
    });
  },
});

export const { setLoading, setError, clearError, clearMessage } = sidebarSlice.actions;

export default sidebarSlice.reducer;
