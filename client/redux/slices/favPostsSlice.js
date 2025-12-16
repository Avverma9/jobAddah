import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/util/apiClient';

// Helper functions from homescreen.jsx
const normalizeJob = (job) => {
    const id = job?.link || job?.url || job?.id || job?._id;
    const title = job?.recruitment?.title || job?.title || job?.postTitle || "Job Post";
    const createdAt =
      job?.createdAt ||
      job?.recruitment?.createdAt ||
      job?.date ||
      job?.recruitment?.date ||
      job?.updatedAt ||
      null;
  
    return { ...job, id, title, createdAt };
  };
  
  const getTimeValue = (job) => {
    const raw = job?.createdAt;
    const t = raw ? new Date(raw).getTime() : NaN;
    if (!Number.isNaN(t)) return t;
    return job?.timestamp || 0;
  };
  
  const sortLatestFirst = (list) => {
    const arr = Array.isArray(list) ? [...list] : [];
    return arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));
  };

export const fetchFavPosts = createAsyncThunk('favPosts/fetchFavPosts', async () => {
  const payload = await api.get('/fav-posts');

  let fav = [];
  if (Array.isArray(payload)) fav = payload;
  else if (Array.isArray(payload?.data)) fav = payload.data;
  else if (Array.isArray(payload?.data?.data)) fav = payload.data.data;

  return sortLatestFirst(fav.map(normalizeJob));
});

const favPostsSlice = createSlice({
  name: 'favPosts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchFavPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default favPostsSlice.reducer;
