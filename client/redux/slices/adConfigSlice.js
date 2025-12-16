import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/util/apiClient';

export const fetchAdConfig = createAsyncThunk('adConfig/fetchAdConfig', async (publisherId) => {
  const config = await api.get('/ad-config', { headers: { 'X-Publisher-ID': publisherId } });
  return config || {};
});

const adConfigSlice = createSlice({
  name: 'adConfig',
  initialState: { config: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchAdConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default adConfigSlice.reducer;
