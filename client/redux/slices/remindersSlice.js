import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/util/apiClient';

export const fetchReminders = createAsyncThunk('reminders/fetchReminders', async () => {
  const payload = await api.get('/reminders/expiring-jobs');
  if (payload?.success) {
    const list = Array.isArray(payload.reminders) ? payload.reminders : [];
    return { expiresToday: list.filter((i) => i.daysLeft === 0), expiringSoon: list.filter((i) => i.daysLeft > 0) };
  }
  return { expiresToday: [], expiringSoon: [] };
});

const remindersSlice = createSlice({
  name: 'reminders',
  initialState: { expiresToday: [], expiringSoon: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.expiresToday = action.payload.expiresToday;
        state.expiringSoon = action.payload.expiringSoon;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default remindersSlice.reducer;
