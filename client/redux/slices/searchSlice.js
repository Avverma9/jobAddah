import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/util/apiClient';

export const fetchSearchResults = createAsyncThunk('search/fetchSearchResults', async (query) => {
  if (!query) return [];
  const payload = await api.get(`/find-by-title?title=${encodeURIComponent(query)}`);
  const results = payload?.data ?? payload;

  // New API shape may return an array of category objects that contain a `jobs` array:
  // { success: true, data: [ { _id, url, jobs: [ { title, link, createdAt, ... } ] } ] }
  // Normalize both shapes: if `jobs` exists, flatten to a jobs array for consumers.
  if (Array.isArray(results) && results.length > 0 && results[0] && Array.isArray(results[0].jobs)) {
    // flatten all jobs arrays into a single list
    const jobs = results.flatMap((item) => (Array.isArray(item.jobs) ? item.jobs.map((j) => ({ ...j, _sourceId: item._id, _sourceUrl: item.url })) : []));
    return jobs;
  }

  return Array.isArray(results) ? results : [];
});

const searchSlice = createSlice({
  name: 'search',
  initialState: { results: [], loading: false, error: null },
  reducers: {
    clearSearch(state) {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
